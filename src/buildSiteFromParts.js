const getS3Part = require('./parts/getS3Part');
const buildConfig = require('./parts/buildConfig');
const mergeDirs = require('merge-dirs').default;

const { resolve } = require('path');
const { partial } = require('lodash');

const { makeDirectory, deleteDirectory } = require('./utils/file');
const { simultanously } = require('./utils/functions');

const parts = require('../parts.json');
const [basicSite] = require('../sites.json');

const getPart = (part, outputDirectory) => {
  switch (part.package.type) {
    case 's3':
      return getS3Part(part.package.bucket, outputDirectory);
  }
};

const getPartByDescription = description => parts.find(part => part.name === description.name);

const mergeDescriptionWithPart = description => ({
  ...description,
  ...getPartByDescription(description),
});

const placePartInSite = (workspaceDirectory, siteDirectory, part) => {
  const partTempDir = `${workspaceDirectory}/part-${part.name}`;
  const partOutputDir = resolve(siteDirectory, part.path || '');
  return getPart(part, partTempDir)
    .then(() => buildConfig('config', part.config, partTempDir))
    .then(() => makeDirectory(partOutputDir))
    .then(() => mergeDirs(partTempDir, partOutputDir))
    .then(() => deleteDirectory(partTempDir))
    .then(() => part.name);
};

const buildSite = (site, workspaceDirectory, siteDirectory) => Promise.all(
  site.partDescriptions
    .map(mergeDescriptionWithPart)
    .map(partial(placePartInSite, workspaceDirectory, siteDirectory))
);

buildSite(basicSite, './workspace', './basic-site')
  .then(console.log)
  .catch(console.error);

module.exports = buildSite;
