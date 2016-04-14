'use strict';

var loopTools = require('../');

function matchMemberAssignment (node, identifierWhitelist) {
  if (node.type !== 'AssignmentExpression' ||
      !node.left ||
      node.left.type !== 'MemberExpression') {
    return false;
  }

  // Instead of doing this recursively, just track a cursor until
  // there are no more child member expressions. This converts
  // n-dimensional member lookups to a list of arguments to `get`.
  var args = [];
  var object = node.left;
  while (object && object.computed && object.type === 'MemberExpression') {
    args.unshift(object.property);
    object = object.object;
  }

  // If the object's name is not whitelisted, then abort:
  if (identifierWhitelist && identifierWhitelist.indexOf(object.name) === -1) {
    return false;
  }

  // The final argument is the value to be set:
  args.push(node.right);

  // If an assignment operator that is not '=', then we convert
  // the expression into a binary expression by duplicating the
  // object and converting to a 'get':
  if (node.operator !== '=') {
    // Convert, e.g. '/=' to simply '/':
    var binaryOperator = node.operator.substr(0, node.operator.length - 1);

    // Write a binary expression to `set`:
    args[args.length - 1] = {
      type: 'BinaryExpression',
      operator: binaryOperator,
      left: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          property: {type: 'Identifier', name: 'get'},
          object: object,
        },
        arguments: args.slice(0, args.length - 1)
      },
      right: args[args.length - 1]
    }
  }

  // Return a call expression to `set` the object's value:
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      property: {type: 'Identifier', name: 'set'},
      object: object
    },
    arguments: args
  };
}

function matchMemberLookup (node, identifierWhitelist) {
  // If not a member expression, ignore:
  if (!node || node.type !== 'MemberExpression') {
    return false;
  }

  // Same as above; traverse the MemberExpression until the
  // object is reached:
  var args = [];
  var object = node;
  while (object && object.computed && object.type === 'MemberExpression') {
    args.unshift(object.property);
    object = object.object;
  }

  // If not whitelisted, abort:
  if (identifierWhitelist && identifierWhitelist.indexOf(object.name) === -1) {
    return false;
  }

  // Convert the member expression to a `get` call expression:
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      property: {type: 'Identifier', name: 'get'},
      object: object
    },
    arguments: args
  };
}

module.exports = loopTools.createPlugin({
  transform: function (root, traverse) {
    var identifierWhitelist = this.options ? this.options.identifierWhitelist : undefined;

    var transform = function (property, node, parent, predecessor) {
      var assignment = matchMemberAssignment(node, identifierWhitelist);
      if (!assignment) {
        var rewrite = matchMemberLookup(node, identifierWhitelist);
        if (!rewrite) {
          return loopTools.RECURSE;
        } else {
          return rewrite;
        }
        return loopTools.RECURSE;
      } else {
        traverse(assignment.arguments[assignment.arguments.length - 1], transform);
        return assignment;
      }
    };

    traverse(root, transform);
  }
});
