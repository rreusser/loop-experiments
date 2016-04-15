'use strict';

var esprima = require('esprima');
var escodegen = require('escodegen');

module.exports = Transformer;

function Transformer (funcOrObject) {
  if (typeof funcOrObject === 'function') {
    this.func = funcOrObject;
    this.ast = esprima.parse(this.func);
  } else if (typeof funcOrObject === 'string') {
    this.func = null;
    this.ast = esprima.parse(funcOrObject, {sourceType: 'script'});
  } else if (typeof funcOrObject === 'object') {
    this.ast = funcOrObject;
  }
}

Transformer.prototype.transform = function (plugin) {
  var context;

  if (plugin.createContext) {
    context = plugin.createContext()();
  } else {
    context = {};
  }

  context._traverse = this._traverse.bind(context);

  if (plugin.transform) {
    plugin.transform.bind(context)(this.ast, this.traverse.bind(context));
  }

  if (plugin.onComplete) {
    plugin.onComplete.bind(context)();
  }

  return this;
};

Transformer.prototype._traverse = require('./traverse');

Transformer.prototype.traverse = function (node, beforeRecurse, afterRecurse, parent) {
  if (typeof beforeRecurse === 'function') {
    var bc = beforeRecurse.bind(this);
  }
  if (typeof afterRecurse === 'function') {
    var ac = afterRecurse.bind(this);
  }

  this._traverse(parent, null, node, bc, ac);

  return this.context;
};

Transformer.prototype.generate = function (options) {
  return escodegen.generate(this.ast, options);
};
