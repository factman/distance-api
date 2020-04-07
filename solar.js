const fs = require('fs');
const express = require("express");
const solarRouter = express.Router();

const dataFile = 'solar.json';

function postData(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data));
}

function getData(initData = [{}]) {
    let fData;

    try {
        fData = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    } catch (e) {
        fData = initData;
    }

    return fData;
}

solarRouter.post('/', (req, res) => {
    postData(req.body);
    res.json({
        status: true,
        message: 'OK',
    });
});

solarRouter.get('/', (req, res) => {
    res.json({
        status: true,
        message: 'OK',
        data: getData().reverse()[0],
    });
});

solarRouter.get('/log', (req, res) => {
    res.json({
        status: true,
        message: 'OK',
        data: getData(),
    });
});

module.exports = {solarRouter};
