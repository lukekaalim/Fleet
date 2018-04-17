const aws = require('aws-sdk');
const mkdirp = require('mkdirp');
const fs = require('fs');
const { dirname, resolve } = require('path');
const { flow, partial, unary } = require('lodash');

const { getBucket } = require('../utils/s3');
const { makeDirectory } = require('../utils/file');

const writeToFile = (directory, buffer) => new Promise(async (resolve, reject) =>
  makeDirectory(dirname(directory))
    .then(() =>
      fs.writeFile(directory, buffer, error => error ? reject(error) : resolve(directory))
    )
);

const mapObjectsToFile = (baseDir, { Key, Body }) => (
  writeToFile(`${baseDir}\\${Key}`, Body)
);

const getS3Part = async (bucket, outputDirectory) => Promise.all(
  (await getBucket(bucket))
    .map(partial(mapObjectsToFile, outputDirectory))
);

module.exports = getS3Part;
