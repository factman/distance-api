const express = require("express");
const inverterRouter = express.Router();
const fs = require('fs');

let socket;
const dataFile = 'inverter.json';

function startInverterSocket(io) {
    io.on('connection', (sock) => {
        socket = sock;
    });
}

function postData(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data));
}

function getData() {
    let fData;

    try {
        fData = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    } catch (e) {
        fData = {};
    }

    return fData;
}

inverterRouter.post('/', (req, res) => {
    postData(req.body);
    res.json({
        status: true,
        message: 'OK',
    });
});

inverterRouter.get('/', (req, res) => {
    res.json({
        status: true,
        message: 'OK',
        data: getData(),
    });
});

inverterRouter.post('/power-toggle', (req, res) => {
    if (socket) {
        if (req.body) {
            socket.emit('power-on', null);
        } else {
            socket.emit('power-off', null);
        }
    }
    res.json({
        status: true,
        message: 'OK',
    });
});

inverterRouter.post('/port1-toggle', (req, res) => {
    if (socket) {
        if (req.body) {
            socket.emit('port1-on', null);
        } else {
            socket.emit('port1-off', null);
        }
    }
    res.json({
        status: true,
        message: 'OK',
    });
});

inverterRouter.post('/port2-toggle', (req, res) => {
    if (socket) {
        if (req.body) {
            socket.emit('port2-on', null);
        } else {
            socket.emit('port2-off', null);
        }
    }
    res.json({
        status: true,
        message: 'OK',
    });
});

module.exports = {inverterRouter, startInverterSocket};
