const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite:data/db.sqlite');

const Exam = sequelize.define('Exam', {
    exam_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    start_timestamp: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_timestamp: {
        type: DataTypes.DATE,
        allowNull: false
    }
},
    {
        tableName: 'exams',
        timestamps: false
    });

const Username = sequelize.define('Username', {
    username_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    exam_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    surname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
},
    {
        tableName: 'usernames',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['exam_id', 'student_id']
            }
        ]
    });

Exam.hasMany(Username, {
    foreignKey: {
        name: 'exam_id'
    }
});

Username.belongsTo(Exam, {
    foreignKey: {
        name: 'exam_id'
    }
});

const Log = sequelize.define('Log', {
    log_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW 
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    information: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
    },
    hostname: {
        type: DataTypes.STRING,
    },
},
    {
        tableName: 'logs',
        timestamps: false
    });

(async () => {
    if (require.main === module) {
        // Create the database
        await sequelize.sync();
    }
})();

module.exports = {
    Exam,
    Username,
    Log
};