const { resolve, relative } = require('path');
const slash = require('slash');
const { contentType } = require('mime-types')
const { tmpdir } = require('os');

const { putObject, clearBucket } = require('./utils/s3');
const { getAllFilesInDirectory, getFileBuffer, deleteDirectory, makeDirectory } = require('./utils/file');

const buildSite = require('./buildSite');

const [basicSite] = require('../sites.json');

const filePathToKey = (filePath, rootDirectory) => slash(relative(rootDirectory, filePath));

const putAllFilesInBucket = (directory, site) => Promise.all(
  getAllFilesInDirectory(directory)
    .map(filePath => getFileBuffer(filePath)
      .then(buffer =>
        putObject(
          site.bucket,
          filePathToKey(filePath, directory),
          buffer,
          contentType(filePath),
        )
      )
    )
);

const deploySite = async (site) => {
  const workspace = await makeDirectory(resolve(tmpdir(), './fleet/workspace'));
  const siteDirectory = await makeDirectory(resolve(tmpdir(), `./fleet/${site.name}`));
  return Promise.all([
    clearBucket(site.bucket),
    buildSite(site, workspace, siteDirectory)
  ])
    .then(() => putAllFilesInBucket(siteDirectory, site))
    .catch(console.error)
    .then(() => deleteDirectory(workspace))
    .then(() => deleteDirectory(siteDirectory));
};

deploySite(basicSite)
  .then(console.log);

module.exports = deploySite;
