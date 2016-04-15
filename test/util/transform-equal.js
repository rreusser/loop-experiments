'use strict';

var loopTools = require('../../');
var esprima = require('esprima');
var escodegen = require('escodegen');

module.exports = function (assert) {
  assert.transformEqual = function transformEqual (input, plugin, expected) {
    var code1 = loopTools.parse(input).transform(plugin).generate();

    var code2 = escodegen.generate(esprima.parse(expected));

    if (code1 !== code2) {
      throw new Error('AssertionError: expected:\n\n' + code1 + '\n\n    to equal:\n\n' + code2);
    }
    assert.equal(code1, code2);
  };
};
