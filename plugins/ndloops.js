'use strict';

var loopTools = require('../');

var indexToGetSet = require('./index-to-get-set');

var ndLoopPragmaRegex = /ndloop(\s+over\s*\((.*)\))?/i;

function matchLoopPragma (node) {
  if (node && node.type === 'ExpressionStatement' && node.expression.type === 'Literal') {
    var match = node.expression.value.match(ndLoopPragmaRegex);
    if (match) {
      return {
        arrayNames: (match[2] || '').split(/[,\s]*/)
      };
    }
  }
}

module.exports = loopTools.createPlugin({
  transform: function (root, traverse) {
    var curLoop = null;
    this.loops = [];

    traverse(root,
      function (property, node, parent, predecessor) {
        if (!curLoop && node.type === 'ForStatement') {
          var loopPragma = matchLoopPragma(predecessor);

          if (loopPragma) {
            curLoop = {node: node, pragma: loopPragma};

            // Handle this section of the tree with different plugins:
            loopTools.apply(node, indexToGetSet({identifiers: loopPragma.arrayNames}));

            // Don't recurse further on this node with this transform:
            return loopTools.NO_RECURSE;
          }
        }
      },
      function (property, node, parent, predecessor) {
        if (curLoop && curLoop.node === node) {
          this.loops.push(curLoop);
          curLoop = null;
        }
      }
    );
  }
});
