# ndloops

### Goal

The goal of this project is to solve the problem of having to write numerical javascript code that handles `ndarrays` (backed by either an array or by `.get`/`set`), `Arrays` of `Arrays`, vanilla `Arrays` and similar storage formats. The transformation is trivial; maintaining five versions of the same code to handle all combinations of inputs is not.

Take a Cholesky decomposition using array-of-arrays-style indexing, for example:

```javascript
var cholesky = function cholesky (A, L) {
  var sum;
  var n = A.shape[0];

  'ndloop over(A, L)';
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < (i + 1); j++) {
      for (var k = 0, sum = 0; i < j; k++) {
        sum += L[i][k] * L.get[j][k];
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
```

We may want this to use get/set notation instead. To direct the transformation, we add a directive in the style of OpenMP `#pragma omp` statements. This instructs `ndloops` how and where to translate. To make the transformation, run

```javascript
loopTools.parse(cholesky).transform(ndloops()).generate();
```

This produces the string:

```javascript
function cholesky(A, L) {
  var sum;
  var n = A.shape[0];
  'ndloop over(A, L)';
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < i + 1; j++) {
      for (var k = 0, sum = 0; i < j; k++) {
        sum += L.get(i, k) * L.get(j, k);
      }
      if (i === j) {
        L.set(i, j, Math.sqrt(A.get(i, i) - sum));
      } else {
        L.set(i, j, (A.get(i, j) - sum) / L.get(j, i));
      }
    }
  }
  return true;
}
```

in which array-of-arrays-style indexing has been transformed into get/set notation.

This represents the current state of the art. As a proof of concept, it's faily straightforward but opens the door to intersesting transformations.

### What's next?

Get/set notation is expensive and not particularly interesting. The next step is to move to more direct pointer indexing for ndarrays backed by actual arrays. This means tracking lvalues and rvalues through the for loops and hosting pointer-like arithmetic so that it's not redundant. Block indexing and for loop reordering for performance is also a reasonable extension, but requires careful tracking of index dependencies and a fair amount more footwork.

Also next is creating a realistic workflow for making runtime decisions on which sort of indexing is necessary and for transforming the result back into cached functions.

### Is it flexible?

The transformation is plugin-based, which means you can apply a sequence of transformations. Each transformation, in turn, can apply plugins itself to all or part of the abstract syntax tree (AST). This allows you to abstract out the transformations and make complex changes to the AST.

### Is esprima a runtime dependency?

Up to you. The goal is to apply transformations and output beautiful, human-readable code. Even if it took 30s and 1MB of minified js to process your code and spit out nicely optimized code, you can always just use the end result and leave out esprima from your runtime dependencies. Enumeration of basic inputs could even be done in a prepublish step so that you commit your `.get`/`.set` code and publish an enumeration over datatypes.

Another possibility is to precompile and package the AST and only include `escodegen` as a dependency. But of course if it's easier to just let esprima do it's thing live and cache the resulting function, then that works too.
