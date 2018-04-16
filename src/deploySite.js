const { resolve } = require('path');
const { partialRight } = require('lodash');

const allParts = require('../parts.json');

const deployToS3 = require('./deployment/deployToS3');
const buildSiteFromParts = require('./buildSiteFromParts');
const buildConfig = require('./buildConfig');

const getPartFromDescription = partDescription =>
  allParts.find(part => part.name === partDescription.name);

const getParts = site => site.partDescriptions.map(getPartFromDescription);

const deploySite = ({ bucket, ...site }, workspace) => (
  buildSiteFromParts(
    getParts(site),
    resolve(workspace),
  )
    .then(siteDirectory => {
      buildConfig('config', site.config, siteDirectory);
      return deployToS3(siteDirectory, bucket)
    })
    .catch(error => console.error(`Unable to deploy site: ${site.name}`, error))
);

module.exports = deploySite;
