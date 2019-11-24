const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const webServer = express();

webServer.use(bodyParser.urlencoded({ extended: false }));

const port = 7180;
const variantsPagePath = path.join(__dirname, 'static', 'variantsPage.html');
const statisticsPagePath = path.join(__dirname, 'static', 'statisticsPage.html');
const statisticsFile = 'statistics.json';

const headers = {
    contentType: "Content-Type",
};

// reads statisticsFile and update it, or creates it with default fields.
const updateStatistics = (value) => {
    let newStatistics = null;

    try {
        const data = fs.readFileSync(path.join(__dirname, statisticsFile), 'utf8');

        const statistics = JSON.parse(data);

        newStatistics = {
            ...statistics,
            [value]: statistics[value] + 1,
        };
    
        fs.writeFileSync(statisticsFile, JSON.stringify(newStatistics));
    } catch (error) {
        newStatistics = {
            option1: 0,
            option2: 0,
            [value]: 1,
        };

        fs.writeFileSync(statisticsFile, JSON.stringify(newStatistics));
    }

    return newStatistics;
};

// receives statistics page (in string) and replaces votes numbers with the real statistics.
const parseStatisticsPage = (pageString, statistics) => {
    let newPageString = pageString;
    
    Object.keys(statistics).forEach((option) => {
        const optionToReplace = new RegExp(`${option}`, 'g');
        newPageString = newPageString.replace(optionToReplace, new String(statistics[option]));
    });
    
    return newPageString;
}

webServer.get('/variants', (req, res) => {
    res.setHeader(headers.contentType, "text/html");

    res.sendFile(variantsPagePath);
});


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

webServer.post('/vote', (req, res) => {
    const votedOption = req.body.group;
    const newStatistics = updateStatistics(votedOption);
    console.log(newStatistics);

    // utf8 is used to read it as string, not Buffer
    fs.readFile(statisticsPagePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            const newPageString = parseStatisticsPage(data, newStatistics);

            res.setHeader(headers.contentType, "text/html");
            res.send(newPageString);
        }
    });
});

webServer.listen(port);