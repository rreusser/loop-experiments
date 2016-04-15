'use strict';

var assert = require('chai').assert;
var loopTools = require('../');
var ndloops = require('../plugins/ndloop');

describe('ndloop plugin', function () {
  describe('a for loop over two arrays', function () {
    var code;

    beforeEach(function () {
      code = loopTools.parse(function test (A, B) {
        'ndloop over(A, B)';
        for (var i = 0; i < 10; i++) {
          A[i] += B[i];
        }
      });
    });

    it('locates a for statement', function () {
      code.transform(ndloops({
        onComplete: function () {
          assert.equal(this.loops.length, 1);
          assert.equal(this.loops[0].node.type, 'ForStatement');
        }
      }));
    });

    it('extracts the arrays from the pragma', function () {
      code.transform(ndloops({
        onComplete: function () {
          assert.deepEqual(this.loops[0].pragma.arrayNames, ['A', 'B']);
        }
      }));
    });
  });
});
