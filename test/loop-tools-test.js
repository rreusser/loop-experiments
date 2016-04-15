'use strict';

var assert = require('chai').assert;
var loopTools = require('../');

describe('loop tools', function () {
  describe('noop plugin', function () {
    var plugin;

    beforeEach(function () {
      plugin = loopTools.createPlugin();
    });

    it('passes code through without non-whitespace modification', function () {
      var func = function func (x) { return x + 1; };

      var transformed = loopTools.parse(func).transform(plugin).generate();

      assert.equal(
        func.toString().replace(/\s+/g, ' '),
        transformed.toString().replace(/\s+/g, ' ')
      );
    });
  });
});
