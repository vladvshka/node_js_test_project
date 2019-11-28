const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer  = require('multer');
const fs = require('fs');

const variantsObject = require('./static/variants.json');

const webServer = express();
const upload = multer();

webServer.use(bodyParser.urlencoded({ extended: false }));
webServer.use(express.static(path.join(__dirname, 'static')));

const port = 7180;
const indexPage = path.join(__dirname, 'static', 'index.html');
const statisticsFileName = 'statistics.json';
const contentTypeHeader = 'Content-Type';

// reads statisticsFile and update it, or creates it with default fields.
const updateStatistics = (value) => {
    let newStatistics = {};

    try {
        const data = fs.readFileSync(path.join(__dirname, statisticsFileName), 'utf8');

        const statistics = JSON.parse(data);
        
        newStatistics = {
            ...statistics,
            [value]: {
                number: statistics[value] ? statistics[value].number + 1 : 1,
                label: variantsObject[value],
            },
        };
    } catch (error) {
        for (const option in variantsObject) {
            if (variantsObject.hasOwnProperty(option)) {
                newStatistics[option] = {
                    number: option === value ? 1 : 0,
                    label: variantsObject[option],
                };
            }
        }
    }

    fs.writeFileSync(statisticsFileName, JSON.stringify(newStatistics));

    return newStatistics;
};

// multered req
webServer.post('/vote', upload.none(), (req, res) => {
    // console.log('req.body', req.body);
    const votedOption = req.body.group;
    const newStatistics = updateStatistics(votedOption);
    console.log(newStatistics);

    res.setHeader(contentTypeHeader, 'application/json');
    res.send(newStatistics);
});

webServer.get('/variants', (req, res) => {
    res.setHeader(contentTypeHeader, 'application/json');
    res.send(JSON.stringify(variantsObject));
});

webServer.get('/mainpage', (req, res) => {
    res.setHeader(contentTypeHeader, 'text/html');
    res.sendFile(indexPage);
});

webServer.listen(port);