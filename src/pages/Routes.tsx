import "./AppDefault.css";

import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";

import packageApp from "../../package.json";
import logo from "../logo.svg";
import LoginScreen from "./LoginScreen";

const AppDefault = () => (
  <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Edit <code>src/App.tsx</code> and save to reload.
      </p>
      <a
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer">
        Learn React & Electron
      </a>
      <small style={{fontSize: 10, fontWeight: "bold"}}>
        Version: {packageApp.version} <br />
        <Link to="/login">Login</Link>
      </small>
    </header>
  </div>
);

const Routes = () => {
  return (
    <Router>
      <div>
        {/* A <Switch> looks through its children <Route>s and
          renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/login" component={LoginScreen} />
          <Route path="/" component={AppDefault} />
        </Switch>
      </div>
    </Router>
  );
};

export default Routes;
