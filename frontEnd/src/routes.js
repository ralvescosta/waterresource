import React from "react"
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import { isAuthenticated } from "./services/auth"
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SingIn"
import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import Produto from './pages/Produto'
import EmailAccept from './pages/EmailAccept'

//Created Private Routes Authenticated with JWT
const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={props =>
        isAuthenticated() ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: "/signin", state: { from: props.location } }} />
        )
      }
    />
  );

const Routes = (props) => (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/signup" component={SignUp} />
        <Route path="/signin" component={SignIn} />
        <Route path="/produto" component={Produto} />
        <Route path="/emailconfirme" component={EmailAccept} />
        <PrivateRoute path="/dashboard" component={Dashboard} />
        <Route path="*" component={() => <h1>Page not found</h1>} />
      </Switch>
    </BrowserRouter>
  );
  
  export default Routes;