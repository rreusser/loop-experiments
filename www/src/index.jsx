import React from 'react';
import ReactDOM from 'react-dom';
import Codemirror from 'react-codemirror';

require("./styles.scss");

import cholesky from './cholesky';
import loopTools from '../../dist/loop-tools.bundle';
import ndloops from '../../plugins/ndloops';

var App = React.createClass({
  getInitialState: function () {
    var code = cholesky.toString().replace(/\t/g,'')
    return {
      code: code,
      transformation: loopTools.parse(code).transform(ndloops()).generate()
    };
  },

  updateCode: function (code) {
    this.setState({
      code: code,
      transformation: loopTools.parse(code).transform(ndloops()).generate()
    });
  },

  render: function () {
    var options = {lineNumbers: true};

    return (
      <Codemirror value={this.state.code} onChange={this.updateCode} options={options}/>
    );
  }
});

ReactDOM.render(<App/>, document.getElementById('app'));
