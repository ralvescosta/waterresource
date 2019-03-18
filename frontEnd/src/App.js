import React, { Component } from 'react';
import Routes from "./routes";
import "./style/global.css";
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faEnvelope, faKey, faUserPlus, faUsers, faMapMarkedAlt, faLaugh, faTachometerAlt, faMobileAlt, faBars} 
  from '@fortawesome/free-solid-svg-icons';

library.add(faEnvelope, faKey, faUserPlus, faUsers, faMapMarkedAlt, faLaugh, faTachometerAlt, faMobileAlt, faBars);


class App extends Component {
  render() {
    return (
      <div className="App">
        <Routes />
      </div>
    );
  }
}

export default App;
