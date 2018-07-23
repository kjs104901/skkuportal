import React from 'react';
import ReactDom from 'react-dom';

import App from './App'

let k = 1;
ReactDom.render(<App test={k} />, document.querySelector('#root'));