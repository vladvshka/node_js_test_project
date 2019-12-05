const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer  = require('multer');
const fs = require('fs');
const etag = require('etag');

const variantsJson = require('./static/variants.json');
const { updateStatistics, getStatFileByFormat } = require('./helpers.js');

const webServer = express();
const upload = multer();

const port = 7180;

webServer.use(bodyParser.urlencoded({ extended: false }));
webServer.use(express.static(path.join(__dirname, 'static')));

const indexPage = path.join(__dirname, 'static', 'index.html');
const statisticsFileName = 'statistics.json';
const headers = {
    contentTypeHeader: 'Content-Type',
    eTag: 'ETag',
    cacheControl: 'Cache-Control',
    ifNoneMatch: 'If-None-Match',
    contentDisposition: 'Content-Disposition',
};
const statFilenames = {
    JSON: 'stat.json',
    HTML: 'stat.html',
    XML: 'stat.xml',
};
const downloadFormats = {
    JSON: 'application/json',
    HTML: 'text/html',
    XML: 'text/xml',
};

webServer.get('/stat', (req, res) => {
    const data = fs.readFileSync(path.join(__dirname, statisticsFileName), 'utf8');
    const eTag = etag(data);

    res.setHeader(headers.cacheControl, 'public, max-age=0');
    res.setHeader(headers.eTag, eTag);
    res.setHeader(headers.contentTypeHeader, 'application/json');
    res.send(data);
});

webServer.get('/download', (req, res) => {
    const format = req.query.format;
    const formats = Object.keys(downloadFormats);

    if (formats.includes(format)) {
        const file = getStatFileByFormat(format);

        res.setHeader(headers.contentDisposition, `attachment; filename="${statFilenames[format]}"`);
        res.setHeader(headers.contentTypeHeader, downloadFormats[format]);
        res.send(file);
    } else {
        res.status(400).send('Invalid format');
    }
});

// multered req
webServer.post('/vote', upload.none(), (req, res) => {
    const votedOption = req.body.group;
    updateStatistics(votedOption);

    res.sendStatus(200);
});

webServer.get('/variants', (req, res) => {
    res.setHeader(headers.contentTypeHeader, 'application/json');
    res.send(variantsJson);
});

webServer.get('/mainpage', (req, res) => {
    res.setHeader(headers.contentTypeHeader, 'text/html');
    res.sendFile(indexPage);
});

webServer.listen(port, () => {console.log(`Voting server is listening on ${port} port`)});