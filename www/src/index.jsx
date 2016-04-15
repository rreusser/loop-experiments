import React from 'react';
import ReactDOM from 'react-dom';
import Codemirror from 'react-codemirror';

require('./styles.scss');

import cholesky from './cholesky';
import loopTools from '../../';
import ndloops from '../../plugins/ndloops';

function transform (code) {
  return loopTools.parse(code).transform(ndloops()).generate({format: {indent: {style: '  '}, preserveBlankLines: true}});
}

var App = React.createClass({
  getInitialState: function () {
    var code = cholesky.toString().replace(/\t/g, '');
    return {
      code: code,
      transformation: transform(code),
      failed: false,
      visible: false
    };
  },

  componentDidMount: function () {
    setTimeout(function () {
      this.setState({visible: true});
    }.bind(this), 500);
  },

  updateCode: function (code) {
    var failed = false;
    var error = null;
    try {
      var trans = transform(code);
    } catch (e) {
      failed = true;
      console.log(e);
      error = e;
    }

    this.setState({
      code: code,
      transformation: trans,
      failed: failed,
      error: error
    });
  },

  renderCode: function () {
    if (!this.state.visible) {
      return null;
    }

    return (
      <div className='container'>
        <div className='code code--input'>
          <Codemirror
            value={this.state.code}
            onChange={this.updateCode}
            options={{lineNumbers: true}}
            className='code-editor'
          />
          {this.state.error ? (
            <div className='errorMessage'>
              <div className='errorMessage-container'>
                <code>
                  {(!this.state.error.description) ? this.state.error.toString() : (
                    `Error:${this.state.error.lineNumber}:${this.state.error.column}: ${this.state.error.description}`
                  )}
                </code>
              </div>
            </div>
          ) : null}
        </div>
        <div className='code code--output'>
          <Codemirror
            value={this.state.transformation}
            options={{lineNumbers: true}}
            className='code-editor'
          />
        </div>
      </div>
    );
  },

  render: function () {
    return (
      <div className="page">
        <div className="nav">
          <h1><a href="https://github.com/rreusser/loop-experiments">loop-experiments</a></h1>
        </div>
        {this.renderCode()}
      </div>
    );
  }
});

ReactDOM.render(<App/>, document.getElementById('app'));
