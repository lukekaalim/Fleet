const aws = require('aws-sdk');

const s3 = new aws.S3();

const deleteObjectByKeys = (bucket, keys) => new Promise((resolve, reject) =>
  s3.deleteObjects({
    Bucket: bucket,
    Delete: { Objects: keys.map(key => ({ Key: key })) },
  }, (err, data) => err ? reject(err) : resolve(data))
);

const putObject = (bucket, key, object, contentType = 'application/octet-stream') => new Promise((resolve, reject) =>
  s3.putObject({
    Bucket: bucket,
    Key: key,
    Body: object,
    ContentType: contentType,
  }, (error, data) => error ? reject(error) : resolve(data))
);

const listBucket = (bucket) => new Promise((resolve, reject) =>
  s3.listObjectsV2({
    Bucket: bucket
  }, (err, data) => err ? reject(err) : resolve(data.Contents),
  ),
);

const getObjectByKey = (bucket, key) => new Promise((resolve, reject) =>
  s3.getObject({
    Bucket: bucket,
    Key: key,
  }, (err, data) => err ? reject(err) : resolve(data),
  ),
);

const clearBucket = async (bucket) => (
  listBucket(bucket)
    .then(contents => (contents.length > 0) && deleteObjectByKeys(
      bucket,
      contents.map(content => content.Key),
    ))
);

const getBucket = async (bucket) => Promise.all(
  (await listBucket(bucket))
    .map(content => getObjectByKey(bucket, content.Key)
      .then(object => ({ ...object, ...content }))
    )
);

module.exports = {
  deleteObjectByKeys,
  putObject,
  listBucket,
  getObjectByKey,
  clearBucket,
  getBucket,
};
