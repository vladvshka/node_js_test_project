const fs = require('fs');
const path = require('path');

const variantsObject = require('./static/variants.json');

const statisticsFileName = 'statistics.json';

const getHTMLstat = (statObject) => {
    const htmlStart = '<!DOCTYPE html><html><body>';
    const htmlEnd = '</body></html>';

    const htmlOptions = Object.keys(statObject).map((key) => {
        const option = statObject[key];
        return `<p>${option.label}: ${option.number}</p>`;
    });

    const htmlBody = `<div>${htmlOptions.join('')}</div>`;

    return htmlStart + htmlBody + htmlEnd;
};

const getXMLstat = (statObject) => {
    const xmlStart = '<?xml version="1.0" encoding="UTF-8" ?><stat>';
    const xmlEnd = '</stat>';

    const xmlOptions = Object.keys(statObject).map((key) => {
        const option = statObject[key];
        return `<option>${option.label}: ${option.number}</option>`;
    });

    const xmlBody = `<container>${xmlOptions.join('')}</container>`;

    return xmlStart + xmlBody + xmlEnd;    
};

// Initialize stat file.
const initStatistics = () => {
    const options = Object.keys(variantsObject);

    if (options.length > 0) {
        const newStatistics = options.reduce((accum, option) => ({
            ...accum,
            [option]: {
                number: 0,
                label: variantsObject[option],
            },
        }), {});
    
        fs.writeFileSync(statisticsFileName, JSON.stringify(newStatistics));

        return newStatistics;
    };

    return null;
};

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

const getStatFileByFormat = (format) => {
    const statJson = fs.readFileSync(path.join(__dirname, statisticsFileName), 'utf8');
    const statObject = JSON.parse(statJson);
    let file = null;

    switch (format) {
        case 'JSON':
            file = statObject;
            break;
    
        case 'HTML':
            file = getHTMLstat(statObject);
            break;

        case 'XML':
            file = getXMLstat(statObject);
            break;

        default:
            break;
    }
   
    return file;
};

module.exports = {
    initStatistics,
    updateStatistics,
    getStatFileByFormat,
};
