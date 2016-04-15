'use strict';

module.exports = function cholesky (A, L) {
  var n = A.shape[0];

  'ndloop over(A, L)';
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < (i + 1); j++) {
      for (var k = 0, sum = 0; i < j; k++) {
        sum += L[i][k] * L[j][k];
      }

      if (i === j) {
        L[i][j] = Math.sqrt(A[i][i] - sum);
      } else {
        L[i][j] = (A[i][j] - sum) / L[j][i];
      }
    }
  }

  return true;
};
