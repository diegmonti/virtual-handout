FROM node:lts-buster
EXPOSE 3000
WORKDIR /home/node/app
COPY *.js *.json ./
RUN npm ci
COPY client/exam.exe ./client/
VOLUME ./data
CMD npm run init && npm start