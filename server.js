const path = require('path');
const express = require('express');
const morgan = require('morgan');
const crypto = require('crypto');
const ipRangeCheck = require("ip-range-check");
const { Op } = require('sequelize');
const { Exam, Username, Log } = require('./database');

const app = express();

app.use(morgan('common'));
app.use(express.raw({type: "application/json"}));

async function getCurrentExamId() {
    // We use UTC in the database!
    const currentTime = new Date();

    // Find a valid exam
    let exam = await Exam.findOne({
        where: {
            start_timestamp: {
                [Op.lte]: currentTime
            },
            end_timestamp: {
                [Op.gte]: currentTime
            }
        }
    });

    if (exam) {
        return exam.exam_id;
    }
}

function validateSignature(message, signature) {
    const hmac = crypto.createHmac('sha256', 'yoursecretkeyhere');
    const data = hmac.update(message);
    const digest = data.digest('hex');
    return digest === signature;
}

function validateClientAddress(address) {
    // TODO
    return ipRangeCheck(address, ["::1"])
}

function getStudentId(username) {
    const regex = /_(\d+)_/;
    let m;

    if ((m = regex.exec(username)) !== null) {
        return m[1];
    } else {
        return -1;
    }
}

async function logAction(address, information, username, hostname) {
    await Log.create({
        address: address,
        information: information,
        username: username,
        hostname: hostname
    });
}

app.get('/', async (req, res) => {
    res.download(path.join(__dirname + '/client/exam.exe'));
});

app.post('/auth', async (req, res) => {
    const payload = JSON.parse(req.body);

    // Check client address
    const clientAddress = req.headers['x-real-ip'] || req.connection.remoteAddress; // TODO
    if (!validateClientAddress(clientAddress)) {
        logAction(clientAddress, "ADDRESS");
        res.status(400).send(JSON.stringify({
            label: "Invalid client address"
        }));
        return;
    }

    // Check payload content
    if (!payload.username || !payload.hostname) {
        logAction(clientAddress, "PAYLOAD");
        res.status(400).send(JSON.stringify({
            label: "Invalid message payload"
        }));
        return;
    }

    // Check client signature
    if (!validateSignature(req.body, req.headers.signature)) {
        logAction(clientAddress, "SIGNATURE", payload.username, payload.hostname);
        res.status(403).send(JSON.stringify({
            label: "Invalid message signature"
        }));
        return;
    }

    // Check exam timestamp
    const exam_id = await getCurrentExamId();
    if (!exam_id) {
        logAction(clientAddress, "TIMESTAMP", payload.username, payload.hostname);
        res.status(404).send(JSON.stringify({
            label: "Service currently unavailable"
        }));
        return;
    }

    // Check student id
    const student_id = getStudentId(payload.username);
    let username = await Username.findOne({
        where: {
            exam_id: exam_id,
            student_id: student_id
        }
    });
    if (!username) {
        logAction(clientAddress, "USERNAME", payload.username, payload.hostname);
        res.status(404).send(JSON.stringify({
            label: "Username not on record"
        }));
        return;
    }

    logAction(clientAddress, "OK", payload.username, payload.hostname);

    res.send(JSON.stringify({
        label: username.name + " " + username.surname + " " + username.student_id,
        username: username.username,
        password: username.password
    }));
});

const server = app.listen(3000, () => {
    let host = server.address().address;
    let port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});