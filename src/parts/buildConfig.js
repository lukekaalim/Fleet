const { writeFileSync } = require('fs');
const mkdirp = require('mkdirp');

const { makeDirectory } = require('../utils/file');

const buildConfig = (name, configuration, outputDirectory) => (
  makeDirectory(outputDirectory)
    .then(() => writeFileSync(
      `${outputDirectory}/${name}.json`,
      JSON.stringify(configuration, null, 3),
    ))
);

module.exports = buildConfig;
