const deploySite = require('./deploySite');

const allSites = require('../sites.json');

allSites.reduce((acc, curr, index) => (
  acc.then(deploySite(curr, './temp'))
), Promise.resolve())
  .then(console.log('++++++++ Deployment Complete ++++++++'))

