import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";

import { AuthUserProvider } from "../session";

import "@kenshooui/react-multi-select/dist/style.css";
import "./App.scss";

const loading = () => (
  <div className="animated fadeIn pt-3 text-center">Loading...</div>
);

// Containers
const DefaultLayout = React.lazy(() => import("../containers/DefaultLayout"));

// Pages
const Login = React.lazy(() => import("../views/Pages/Login"));
// const ForgotPassword = React.lazy(() => import('../views/Pages/ForgotPassword'));
const Page404 = React.lazy(() => import("../views/Pages/Page404"));

export default function App() {
  return (
    <AuthUserProvider>
      <HashRouter>
        <React.Suspense fallback={loading()}>
          <Switch>
            <Route
              exact
              path="/login"
              name="Login Page"
              render={(props) => <Login {...props} />}
            />
            {/* <Route exact path="/forgot-password" name="Forgot Password Page" render={props => <ForgotPassword {...props}/>} /> */}
            <Route
              exact
              path="/404"
              name="Page 404"
              render={(props) => <Page404 {...props} />}
            />
            <Route
              path="/"
              name="Home"
              render={(props) => <DefaultLayout {...props} />}
            />
          </Switch>
        </React.Suspense>
      </HashRouter>
    </AuthUserProvider>
  );
}
