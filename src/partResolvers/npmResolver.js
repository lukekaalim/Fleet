const downloadPackage = require('download-npm-package');

const resolveNpmPart = (part, dest) => console.log(part) || (
  downloadPackage({
    arg: `${part.package.name}/${part.package.version}`,
    dir: dest,
  })
  .then(() => `${dest}/${part.package.name}`)
  .catch(console.error)
);

module.exports = resolveNpmPart;
