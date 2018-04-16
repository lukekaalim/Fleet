const s3 = require('./partResolvers/s3Resolver');
const mergeDirs = require('merge-dirs').default;
const mkdirp = require('mkdirp');

const packageResolvers = {
  s3,
};

const getPackageResolver = packageType => packageResolvers[packageType];

const buildSiteFromParts = (parts, dest) => (
  Promise.all(
    parts.map(part => {
      const partDirectory = `${dest}/temp-packages/${part.name}`;
      const resolver = getPackageResolver(part.package.type);
      return resolver(part, partDirectory)
        .then(() => partDirectory)
        .catch(() => null);
    })
  )
    .then(partDirectories => {
      const destinationDirectory = `${dest}/destination`;
      return new Promise(resolve => mkdirp(destinationDirectory, resolve))
        .then(() => partDirectories
          .filter(Boolean)
          .forEach(
            partDirectory => mergeDirs(partDirectory, destinationDirectory, 'overwrite')
          ))
        .then(() => destinationDirectory);
    })
    .catch(error => console.error('error', error))
);

module.exports = buildSiteFromParts;
