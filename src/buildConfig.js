const { writeFileSync } = require('fs');
const mkdirp = require('mkdirp');

const buildConfig = (configName, configuration, directoryToWriteTo) => (
  writeFileSync(
    `${directoryToWriteTo}/${configName}.json`,
    JSON.stringify(configuration, null, 3),
  )
);

module.exports = buildConfig;
