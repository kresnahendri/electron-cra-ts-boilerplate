import "./AppDefault.css";

import {Button} from "@chakra-ui/react";
import {useState} from "react";
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";

import logo from "../logo.svg";
import LoginScreen from "./LoginScreen";

const {ipcRenderer} = window.require("electron");

const AppDefault = () => {
  const [version, setVersion] = useState();
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [updateDownload, setUpdateDownload] = useState<string | null>(null);

  ipcRenderer.send("app_version");
  ipcRenderer.on("app_version", (_, arg) => {
    console.log(arg);
    ipcRenderer.removeAllListeners("app_version");
    setVersion(arg.version);
  });

  ipcRenderer.on("update_available", () => {
    ipcRenderer.removeAllListeners("update_available");
    setUpdateMessage("A new update is available. Downloading now...");
  });
  ipcRenderer.on("update_downloaded", () => {
    ipcRenderer.removeAllListeners("update_downloaded");
    setUpdateDownload(
      "Update Downloaded. It will be installed on restart. Restart now?",
    );
  });

  const restartApp = () => {
    ipcRenderer.send("restart_app");
  };

  return (
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
          {"Learn React & Electron"}
        </a>
        <small style={{fontSize: 10, fontWeight: "bold"}}>
          Version: {version} <br />
          <Link to="/login">Login</Link>
        </small>
      </header>
      <p>{updateMessage}</p>
      {updateDownload && (
        <div>
          <p>{updateDownload}</p>
          <Button onClick={restartApp}>Restrat App</Button>
        </div>
      )}
    </div>
  );
};

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
