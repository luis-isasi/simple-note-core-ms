const minorDeps = ['@types/node', '@blum-rivendell/theshire'];

/** Custom target.
  @param dependencyName The name of the dependency.
  @param parsedVersion A parsed Semver object from semver-utils.
  @returns One of the valid target values (specified in the table above).
*/
module.exports = {
  target: (dependencyName) => {
    if (minorDeps.includes(dependencyName)) {
      return 'minor';
    }
    return 'latest';
  },
};
