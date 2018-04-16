// Source:
// https://gist.github.com/jlouros/9abc14239b0d9d8947a3345b99c4ebcb

const aws = require("aws-sdk");
const { readdirSync, lstatSync, readFile } = require("fs");
const { relative } = require("path");
const slash = require('slash');
const mime = require('mime-types')
const { flow } = require('lodash');

const s3 = new aws.S3({ signatureVersion: 'v4' });

const throwIfFirstArg = (func) => (firstArg, ...args) => {
	if (firstArg) {
		throw firstArg;
	}
	return func(...args);
};

const hasFiles = files => files && files.length >= 0;

const reduceAndTraverseChildDirectories = (fileNamesSoFar, currentfileName) => ([
	...fileNamesSoFar,
	...(lstatSync(currentfileName).isDirectory() ?
		getAllFilePathsInDirectory(currentfileName)
		:
		[currentfileName])
]);

const getAllFilePathsInDirectory = directory => {
	const files = readdirSync(directory);
	if (!hasFiles(files)) {
		return [];
	}
	return files
		.map(file => `${directory}/${file}`)
		.reduce(reduceAndTraverseChildDirectories, [])
};

const getRelativePath = flow(relative, slash);

const rejectOnError = reject => (error, sucess) => {
	if (error) {
		throw error;
	}
	return sucess;
}

const logSuccess = file => success => console.log(`Upload sucess: ${file}`)

const deployToS3 = (directory, bucket) => (
	Promise.all(getAllFilePathsInDirectory(directory)
		.map(filePath => new Promise((resolve, reject) => {
			const relativePath = getRelativePath(directory, filePath);
			readFile(filePath, throwIfFirstArg(fileContent => (
				s3.putObject({
					Bucket: bucket,
					Key: relativePath,
					Body: fileContent,
					ContentType: mime.contentType(filePath) || 'application/octet-stream',
				}, flow(rejectOnError(reject), logSuccess(relativePath), resolve))
			))
			)
		})
		)
	)
);

module.exports = deployToS3;