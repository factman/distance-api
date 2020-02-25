"use strict";
const express = require("express");
const fs = require('fs');
const powerRouter = express.Router();

const dataFile = 'power.json';
let socket;

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

function startPowerSocket(io) {
    io.on('connection', (sock) => {
        socket = sock;
    });
}

powerRouter.post('/', (req, res) => {
    postData(req.body);
    res.json({
        status: true,
        message: 'OK',
    });
});

powerRouter.get('/', (req, res) => {
    const data = getData();
    res.json({
        status: true,
        message: 'OK',
        data,
    });
});

powerRouter.post('/power-toggle', (req, res) => {
    const data = req.body;
    if (socket) {
        if (data.power) {
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

powerRouter.post('/power-offset', (req, res) => {
    const data = req.body;
    if (socket) {
        socket.emit('power-offset', data);
    }
    res.json({
        status: true,
        message: 'OK',
    });
});

module.exports = {powerRouter, startPowerSocket};
