const  { resolve } = require('path');
const deploy = require('deploy');

const partsList = require('./parts.json');
const sitesList = require('./sites.json');

const TEMP_WORKING_DIR = resolve('./TEMP');

const partMatchPartReference = (partReference) => (part) => (
    part.name === partReference.name &&
    part.version === partReference.version
);

sitesList.forEach((site) => {
    const { name, bucket, parts } = site;
    const compiledPartDirectories = parts.map(partReference => {
        const fullPart = partsList.find(partMatchPartReference(partReference));
        
    });
    // download all parts
    // merge all parts
    // build config.json
    // deploy parts to bucket
    // log site name

});

//stagePackages(TEMP_WORKING_DIR);