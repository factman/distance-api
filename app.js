const app = require('express')();
const cors = require('cors');
const helmet = require('helmet');
const logger = require('morgan');
const compression = require('compression');
const jsonParser = require('body-parser').json;
const fs = require('fs');

// helmet middleware implementation
app.use(helmet());

// logger middleware implementation
app.use(logger('dev'));

// json parser middleware implementation
app.use(jsonParser({ limit: "10mb" }));

// cors middleware implementation
app.use(cors());

// compression middleware implementation
app.use(compression());


const file = "./log.json";

function log(data) {
    let fData;

    try {
        fData = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (e) {
        fData = [];
    }

    if (fData.length >= 80000) { // 12 hours
        fData.splice(0, 7000); // 1hour
    }

    fData.push(Object.assign({}, data, {createdAt: new Date()}));
    fs.writeFileSync(file, JSON.stringify(fData));
}

function loadData() {
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

    fs.writeFileSync(file, JSON.stringify(data));
}   
    
function getLogs() {
    try {
        return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (e) {
        return [];
    }
}

function deleteLogs() {
    fs.writeFileSync(file, JSON.stringify([]));
}

// Post data.
app.post('/post', (req, res) => {
    log(req.body);
    res.json({
        success: true,
        status: 'OK',
    });
});

// Fetch data.
app.get('/get', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        data: getLogs(),
    });
});

// Fetch live data
app.get('/get/live', (req, res) => {
    const logs = getLogs();
    res.json({
        success: true,
        status: 'OK',
        data: logs[logs.length - 1] || null,
    });
});

// Fetch data with limit
app.get('/get/:limit', (req, res) => {
    const limit = req.params.limit;
    const logs = getLogs();
    logs.splice(0, logs.length - limit);
    res.json({
        success: true,
        status: 'OK',
        data: logs,
    });
});

// Delete data
app.delete('/delete', (req, res) => {
    deleteLogs();
    res.json({
        success: true,
        status: 'OK',
    });
});

app.put('/load/test', (req, res) => {
    deleteLogs();
    loadData();
    res.json({
        success: true,
        status: 'OK',
        data: getLogs(),
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
app.listen(port, () => {
    console.log('Server Listening On:', port);
});
