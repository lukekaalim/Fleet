const { unary } = require('lodash');

const deploySite = require('./deploySite');

const allSites = require('../sites.json');

allSites.forEach(unary(deploySite));
