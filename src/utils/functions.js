const simultanously = (...funcs) => (...args) => funcs.map(func => func(...args));

module.exports = {
  simultanously,
};
