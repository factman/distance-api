"use strict";
const app = require('express')();
const cors = require('cors');
const helmet = require('helmet');
const logger = require('morgan');
const compression = require('compression');
const jsonParser = require('body-parser').json;
const fs = require('fs');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {startSocket, poultryRouter} = require('./poultry');

// helmet middleware implementation
app.use(helmet());

// logger middleware implementation
app.use(logger('dev'));

// json parser middleware implementation
app.use(jsonParser({ limit: "10mb" }));

// cors middleware implementation
app.use(cors({origin: '*'}));

// compression middleware implementation
app.use(compression());


const file = "log.json";
const appsFile = "./apps.json";

startSocket(io);

function readFile(file) {
    let data;

    try {
        data = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (e) {
        data = [];
    }

    return data;
}

function createApp(data) {
    const fData = readFile(appsFile);
    fData.push(Object.assign({}, data, {createdAt: new Date()}));
    fs.writeFileSync(appsFile, JSON.stringify(fData));
}

function editApp(data, id) {
    let fData = readFile(appsFile);
    fData = fData.map(value => (value.id === id) ? data : value);
    fs.writeFileSync(appsFile, JSON.stringify(fData));
}

function deleteApp(id) {
    let fData = readFile(appsFile);
    fData = fData.filter(value => value.id !== id);
    fs.writeFileSync(appsFile, JSON.stringify(fData));
}

function log(data, id) {
    let fData = readFile(`./${id}_${file}`);

    if (fData.length >= 80000) { // 12 hours
        fData.splice(0, 7000); // 1hour
    }

    fData.push(Object.assign({}, data, {createdAt: new Date()}));
    fs.writeFileSync(`./${id}_${file}`, JSON.stringify(fData));
}

function loadData(id) {
    let x = 0;
    const data = [];

    while (x < 80000) {
        data.push({
            ping: Math.floor(Math.random() * (Math.random() * 400)),
            temp: Math.floor(Math.random() * (Math.random() * 100)),
            createdAt: new Date(),
        });
        x++;
    }

    fs.writeFileSync(`./${id}_${file}`, JSON.stringify(data));
}

function getLogs(id) {
    return readFile(`./${id}_${file}`);
}

function getApps() {
    return readFile(appsFile);
}

function deleteLogs(id) {
    fs.writeFileSync(`./${id}_${file}`, JSON.stringify([]));
}

// Create App.
app.post('/create', (req, res) => {
    createApp(req.body);
    res.json({
        success: true,
        status: 'OK',
    });
});

// Fetch apps.
app.get('/apps', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        data: getApps(),
    });
});

// Poultry Router
app.use('/poultry', poultryRouter);

// Fetch apps.
app.get('/apps/:id', (req, res) => {
    const id = req.params.id;
    const data = getApps().filter(val => val.id === id)[0];
    res.json({
        success: true,
        status: 'OK',
        data: data || null,
    });
});

// Edit apps.
app.put('/apps/:id', (req, res) => {
    const id = req.params.id;
    editApp(req.body, id);
    res.json({
        success: true,
        status: 'OK',
        data: req.body,
    });
});

// Delete apps.
app.delete('/apps/:id', (req, res) => {
    const id = req.params.id;
    deleteApp(id);
    res.json({
        success: true,
        status: 'OK',
    });
});

// Post data.
app.post('/post/:id', (req, res) => {
    const id = req.params.id;
    log(req.body, id);
    res.json({
        success: true,
        status: 'OK',
    });
});

// Fetch data.
app.get('/get/:id', (req, res) => {
    const id = req.params.id;
    res.json({
        success: true,
        status: 'OK',
        data: getLogs(id),
    });
});

// Delete data
app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
    deleteLogs(id);
    res.json({
        success: true,
        status: 'OK',
    });
});

// Fetch live data
app.get('/get/live/:id', (req, res) => {
    const id = req.params.id;
    const logs = getLogs(id);
    res.json({
        success: true,
        status: 'OK',
        data: logs[logs.length - 1] || null,
    });
});

// Load sample data
app.put('/load/test/:id', (req, res) => {
    const id = req.params.id;
    deleteLogs(id);
    loadData(id);
    res.json({
        success: true,
        status: 'OK',
        data: getLogs(id),
    });
});

// Fetch data with limit
app.get('/get/:id/:limit', (req, res) => {
    const id = req.params.id;
    const limit = req.params.limit;
    const logs = getLogs(id);
    logs.splice(0, logs.length - limit);
    res.json({
        success: true,
        status: 'OK',
        data: logs,
    });
});

/**
 * @description catch 404 error and forward to error handler.
 */
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        status: 'NOT FOUND'
    });
});

// defining Port number
const port = process.env.PORT || 5000;

// server listener.
server.listen(port, () => {
    console.log('Server Listening On:', port);
});
