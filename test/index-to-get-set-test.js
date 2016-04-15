'use strict';

var assert = require('chai').assert;
var indexToGetSet = require('../plugins/index-to-get-set');
require('./util/transform-equal')(assert);

var A, x, i, j, k, l, m;

describe('array of array to get/set notation (e.g. A[i] => A.get(i))', function () {
  describe('1-D indexing', function () {
    describe('get', function () {
      it('transforms rvalue into .get', function () {
        assert.transformEqual(
          function f () { x = A[i]; },
          indexToGetSet({identifiers: ['A']}),
          function f () { x = A.get(i); }
        );
      });

      it('does not transform if not in whitelist', function () {
        assert.transformEqual(
          function f () { x = A[i]; },
          indexToGetSet({identifiers: ['D']}),
          function f () { x = A[i]; }
        );
      });

      it('does not transform if no whitelist provided', function () {
        assert.transformEqual(
          function f () { x = A[i]; },
          indexToGetSet(),
          function f () { x = A[i]; }
        );
      });
    });

    describe('set', function () {
      it('transforms lvalue into .set', function () {
        assert.transformEqual(
          function f () { A[i] = 5; },
          indexToGetSet({identifiers: ['A']}),
          function f () { A.set(i, 5); }
        );
      });

      it('does not transform if not in whitelist', function () {
        assert.transformEqual(
          function f () { A[i] = 5; },
          indexToGetSet({identifiers: ['D']}),
          function f () { A[i] = 5; }
        );
      });

      it('does not transform if no whitelist provided', function () {
        assert.transformEqual(
          function f () { A[i] = 5; },
          indexToGetSet(),
          function f () { A[i] = 5; }
        );
      });
    });

    it('transforms bare node into .get', function () {
      assert.transformEqual(
        function f () { A[i]; },
        indexToGetSet({identifiers: ['A']}),
        function f () { A.get(i); }
      );
    });

    it('transforms recursively', function () {
      assert.transformEqual(
        function f () { A[i] = A[j] + 7; },
        indexToGetSet({identifiers: ['A']}),
        function f () { A.set(i, A.get(j) + 7); }
      );
    });

    describe('assignment operators', function () {
      it('+=', function () {
        assert.transformEqual(
          function f () { A[i] += A[j]; },
          indexToGetSet({identifiers: ['A']}),
          function f () { A.set(i, A.get(i) + A.get(j)); }
        );
      });

      it('>>>=', function () {
        assert.transformEqual(
          function f () { A[i] += A[j]; },
          indexToGetSet({identifiers: ['A']}),
          function f () { A.set(i, A.get(i) + A.get(j)); }
        );
      });
    });

    describe('update operators (unsupported)', function () {
      it('x++ unaffected', function () {
        assert.transformEqual(
          function f () { x++; },
          indexToGetSet({identifiers: ['A']}),
          function f () { x++; }
        );
      });

      it('++A[i] unsupported', function () {
        assert.throws(function () {
          assert.transformEqual(
            function f () { A[i]++; },
            indexToGetSet({identifiers: ['A']}),
            function f () { A.set(i, A.get(i) + 1); }
          );
        }, Error, /Transformation of unary array element increment\/decrement is not supported/);
      });

      it('A[i]++ unsupported', function () {
        assert.throws(function () {
          assert.transformEqual(
            function f () { ++A[i]; },
            indexToGetSet({identifiers: ['A']}),
            function f () { A.set(i, A.get(i) + 1); }
          );
        }, Error, /Transformation of unary array element increment\/decrement is not supported/);
      });
    });
  });

  describe('2-D indexing', function () {
    it('transforms lvalue into .set', function () {
      assert.transformEqual(
        function f () { A[i][j] = 5; },
        indexToGetSet({identifiers: ['A']}),
        function f () { A.set(i, j, 5); }
      );
    });

    it('transforms rvalue into .get', function () {
      assert.transformEqual(
        function f () { x = A[i][2]; },
        indexToGetSet({identifiers: ['A']}),
        function f () { x = A.get(i, 2); }
      );
    });

    it('transforms bare node into .get', function () {
      assert.transformEqual(
        function f () { A[i][k + 1]; },
        indexToGetSet({identifiers: ['A']}),
        function f () { A.get(i, k + 1); }
      );
    });

    it('transforms recursively', function () {
      assert.transformEqual(
        function f () { A[i][l] = A[j][k] + 7; },
        indexToGetSet({identifiers: ['A']}),
        function f () { A.set(i, l, A.get(j, k) + 7); }
      );
    });

    describe('assignment operators', function () {
      it('+=', function () {
        assert.transformEqual(
          function f () { A[i][k] += A[j][k]; },
          indexToGetSet({identifiers: ['A']}),
          function f () { A.set(i, k, A.get(i, k) + A.get(j, k)); }
        );
      });

      it('>>>=', function () {
        assert.transformEqual(
          function f () { A[i][k] += A[j][k]; },
          indexToGetSet({identifiers: ['A']}),
          function f () { A.set(i, k, A.get(i, k) + A.get(j, k)); }
        );
      });
    });
  });

  describe('3-D indexing', function () {
    it('transforms lvalue into .set', function () {
      assert.transformEqual(
        function f () { A[i][j][k] = 5; },
        indexToGetSet({identifiers: ['A']}),
        function f () { A.set(i, j, k, 5); }
      );
    });

    it('transforms rvalue into .get', function () {
      assert.transformEqual(
        function f () { x = A[i][2][j]; },
        indexToGetSet({identifiers: ['A']}),
        function f () { x = A.get(i, 2, j); }
      );
    });
  });

  describe('5-D indexing', function () {
    it('transforms lvalue into .set', function () {
      assert.transformEqual(
        function f () { A[i][j][k][l][m] = 5; },
        indexToGetSet({identifiers: ['A']}),
        function f () { A.set(i, j, k, l, m, 5); }
      );
    });

    it('transforms rvalue into .get', function () {
      assert.transformEqual(
        function f () { x = A[i][2][j][k][l]; },
        indexToGetSet({identifiers: ['A']}),
        function f () { x = A.get(i, 2, j, k, l); }
      );
    });
  });
});
