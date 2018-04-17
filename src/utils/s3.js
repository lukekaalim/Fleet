const aws = require('aws-sdk');

const s3 = new aws.S3();

const deleteObjectByKeys = (bucket, keys) => new Promise((resolve, reject) =>
  s3.deleteObjects({
    Bucket: bucket,
    Delete: keys.map(key => ({ Key: key })),
  }, (err, data) => err ? reject(err) : resolve(data))
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
  deleteObjectByKeys(bucket, await listBucket(bucket))
);

const getBucket = async (bucket) => Promise.all(
  (await listBucket(bucket))
    .map(content => getObjectByKey(bucket, content.Key)
      .then(object => ({ ...object, ...content }))
    )
);

module.exports = {
  deleteObjectByKeys,
  listBucket,
  getObjectByKey,
  clearBucket,
  getBucket,
};
