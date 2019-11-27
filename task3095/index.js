const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer  = require('multer');

const fs = require('fs');
const variants = require('./static/variants.json');

const webServer = express();
const upload = multer();

webServer.use(bodyParser.urlencoded({ extended: false }));
webServer.use(express.static(path.join(__dirname, 'static')));

const port = 7180;
const variantsPagePath = path.join(__dirname, 'static', 'variantsPage.html');
const statisticsPagePath = path.join(__dirname, 'static', 'statisticsPage.html');
const statisticsFile = 'statistics.json';

const headers = {
    contentType: "Content-Type",
};

// reads statisticsFile and update it, or creates it with default fields.
const updateStatistics = (value) => {
    let newStatistics = {};

    try {
        const data = fs.readFileSync(path.join(__dirname, statisticsFile), 'utf8');

        const statistics = JSON.parse(data);
        
        newStatistics = {
            ...statistics,
            [value]: {
                number: statistics[value].number + 1,
                label: statistics[value].label,
            },
        };
    } catch (error) {
        for (const option in variants) {
            if (variants.hasOwnProperty(option)) {
                newStatistics[option] = {
                    number: option === value ? 1 : 0,
                    label: variants[option],
                };
            }
        }
    }

    fs.writeFileSync(statisticsFile, JSON.stringify(newStatistics));

    return newStatistics;
};

webServer.get('/stat', (req, res) => {
    try {
        const statJson = fs.readFileSync(path.join(__dirname, statisticsFile), 'utf8');

        const statisticsObject = JSON.parse(statJson);

        const data = fs.readFileSync(statisticsPagePath, 'utf8');

        const statisticsPage = parseStatisticsPage(data, statisticsObject);
    
        res.setHeader(headers.contentType, "text/html");
        res.send(statisticsPage);
    } catch (err) {
        console.log('err', err)
        res.setHeader(headers.contentType, "text/html");
    
        res.sendFile(variantsPagePath);
    }
});

// multed req
webServer.post('/vote', upload.none(), (req, res) => {
    // console.log('req.body', req.body);
    const votedOption = req.body.group;
    const newStatistics = updateStatistics(votedOption);
    console.log(newStatistics);

    res.setHeader(headers.contentType, "application/json");
    res.send(newStatistics);
});

webServer.get('/variants', (req, res) => {
    res.setHeader(headers.contentType, "application/json");
    res.send(JSON.stringify(variants));
});

webServer.get('/mainpage', (req, res) => {
    res.setHeader(headers.contentType, "text/html");
    res.sendFile(variantsPagePath);
});

webServer.listen(port);