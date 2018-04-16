const aws = require('aws-sdk');
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const { flow, partial, unary } = require('lodash');

const s3 = new aws.S3();

const listBucketObjects = bucketName => new Promise(
  (resolve, reject) => s3.listObjectsV2(
    { Bucket: bucketName },
    (err, data) => err ? reject(err) : resolve({ bucketName, contents: data.Contents }),
  ),
);

const getObjectInfoKey = objectInfo => objectInfo.Key;

const getObjectByKey = (bucketName, key) => new Promise(
  (resolve, reject) => s3.getObject(
    { Bucket: bucketName, Key: key },
    (err, data) => err ? reject(err) : resolve({ ...data, key }),
  ),
);

const writeToFile = (directory, buffer) => new Promise(
  (resolve, reject) => mkdirp(path.dirname(directory),
    mkdirpError => (
      mkdirpError ? reject(mkdirpError) : fs.writeFile(directory, buffer,
        writeError => writeError ? reject(writeError) : resolve(directory),
      )
    )
  )
);

const mapObjectListToGetPromise = ({ bucketName, contents }) =>
  contents.map(flow(getObjectInfoKey, partial(getObjectByKey, bucketName)));

const mapObjectBodiesToFile = (baseDir) => (objects) => objects.map(
  object => writeToFile(`${baseDir}\\${object.key}`, object.Body)
);

const fetchBucket = bucket => listBucketObjects(bucket)
  .then(mapObjectListToGetPromise)

const logAndContinueError = part => (error) => {
  console.error(`Could not get part: ${part.name}`, error);
  throw error;
};

const getS3Part = (part, baseDir) => (
  fetchBucket(part.package.bucket)
    .then(unary(Promise.all))
    .then(mapObjectBodiesToFile(baseDir))
    .catch(logAndContinueError(part))
);

module.exports = getS3Part;
