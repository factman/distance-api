"use strict";
const express = require("express");
const fs = require('fs');
const poultryRouter = express.Router();

const dataFile = 'poultry.json';
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

function startSocket(io) {
    io.on('connection', (sock) => {
        socket = sock;
    });
}

poultryRouter.post('/', (req, res) => {
    postData(req.body);
    res.json({
        status: true,
        message: 'OK',
    });
});

poultryRouter.get('/', (req, res) => {
    const data = getData();
    res.json({
        status: true,
        message: 'OK',
        data,
    });
});

poultryRouter.post('/change-mode', (req, res) => {
    const data = req.body;
    socket.emit('change-mode', data);
    res.json({
        status: true,
        message: 'OK',
    });
});

poultryRouter.post('/toggle-heater', (req, res) => {
    const data = req.body;
    socket.emit('toggle-heater', data);
    res.json({
        status: true,
        message: 'OK',
    });
});

poultryRouter.post('/toggle-cooler', (req, res) => {
    const data = req.body;
    socket.emit('toggle-cooler', data);
    res.json({
        status: true,
        message: 'OK',
    });
});

poultryRouter.post('/set-params', (req, res) => {
    const data = req.body;
    socket.emit('set-params', data);
    res.json({
        status: true,
        message: 'OK',
    });
});

module.exports = {poultryRouter, startSocket};
