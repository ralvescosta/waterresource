import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css'; 
import 'mdbreact/dist/css/mdb.css';
import {inicializerFirebase} from '../src/services/push-notification'

ReactDOM.render(<App />, document.getElementById('root'));
inicializerFirebase();
