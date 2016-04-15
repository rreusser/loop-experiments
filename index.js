'use strict';

var Transformer = require('./src/transformer');

var loopTools = {
  NO_RECURSE: false,
  RECURSE: true,

  createPlugin: function (definition) {
    return function (options) {
      options = options || {};
      return {
        createContext: function () {
          if (definition.createContext) {
            return definition.createContext(options);
          } else {
            return function () {
              return {options: options};
            };
          }
        },
        transform: definition.transform,
        onComplete: options.onComplete
      };
    };
  },
  parse: function (func) {
    return new Transformer(func);
  },
  apply: function (astOrFunction, plugin) {
    return new Transformer(astOrFunction).transform(plugin);
  }
};

module.exports = loopTools;
