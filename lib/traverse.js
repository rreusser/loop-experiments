'use strict';

var esprima = require('esprima');

module.exports = function _traverse (propertyName, propertyIndex, node, beforeRecurse, afterRecurse, parent, predecessor) {
  if (!node) {
    return;
  }

  if (Array.isArray(node)) {
    for (var i = 0, pred = null; i < node.length; pred = node[i++]) {
      this._traverse(propertyName, i, node[i], beforeRecurse, afterRecurse, parent, pred);
    }
  }

  if (!node.type || !esprima.Syntax[node.type]) {
    return;
  }

  var preventRecurse = false;

  if (beforeRecurse) {
    var result = beforeRecurse(propertyName, node, parent, predecessor);
    if (result === false) {
      preventRecurse = true;
    } else if (typeof result === 'object') {
      preventRecurse = true;
      node = result;
      if (propertyIndex) {
        parent[propertyName][propertyIndex] = result;
      } else {
        parent[propertyName] = result;
      }
    }
  }

  if (!preventRecurse) {
    for (var property in node) {
      if (node.hasOwnProperty(property) && property !== 'type') {
        this._traverse(property, null, node[property], beforeRecurse, afterRecurse, node);
      }
    }
  }

  afterRecurse && afterRecurse(propertyName, node, parent, predecessor);
};
