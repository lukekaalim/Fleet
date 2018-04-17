const { readdirSync, lstatSync, readFile } = require("fs");
const { resolve, dirname } = require('path');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const { negate, unary, partial, flow } = require('lodash');

const flatten = (acc, curr) => [...acc, ...curr];

const isDirectory = path => lstatSync(path).isDirectory();
const isFile = path => lstatSync(path).isFile();

const makeDirectory = directory => new Promise((resolve, reject) =>
  mkdirp(dirname(directory), error => error ? reject(error) : resolve(directory))
);

const deleteDirectory = directory => new Promise((resolve, reject) =>
  rimraf(directory, { disableGlob: true }, error => error ? reject(error) : resolve(directory))
);

const getAllDirectoriesInDirectory = directory => (
  readdirSync(directory)
    .map(unary(partial(resolve, directory)))
    .filter(isDirectory)
    .map(getAllDirectoriesInDirectory)
    .reduce(flatten, [directory])
);

const getLocalFilesInDirectory = directory => (
  readdirSync(directory)
    .map(unary(partial(resolve, directory)))
    .filter(isFile)
);

const getAllFilesInDirectory = directory => (
  getAllDirectoriesInDirectory(directory)
    .map(getLocalFilesInDirectory)
    .reduce(flatten, [])
);

module.exports = {
  deleteDirectory,
  makeDirectory,
  getAllDirectoriesInDirectory,
  getLocalFilesInDirectory,
  getAllFilesInDirectory,
};
