import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { HashRouter } from 'react-router-dom';
import Firebase, { FirebaseContext } from '../firebase';
// import { renderRoutes } from 'react-router-config';

import './App.scss';

const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;

// Containers
const DefaultLayout = React.lazy(() => import('../containers/DefaultLayout'));

// Pages
const Login = React.lazy(() => import('../views/Pages/Login'));
const Page404 = React.lazy(() => import('../views/Pages/Page404'));

class App extends Component {

	render() {
		return (
			<FirebaseContext.Provider value={new Firebase()}>
				<HashRouter>
					<React.Suspense fallback={loading()}>
						<Switch>
							<Route exact path="/login" name="Login Page" render={props => <Login {...props}/>} />
							<Route exact path="/404" name="Page 404" render={props => <Page404 {...props}/>} />
							<Route path="/" name="Home" render={props => <DefaultLayout {...props}/>} />
						</Switch>
					</React.Suspense>
				</HashRouter>,
			</FirebaseContext.Provider>
		);
	}
}

export default App;
