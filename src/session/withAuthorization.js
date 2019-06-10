import React from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import AuthUserContext from './context';
import { withFirebase } from '../firebase';

const withAuthorization = (condition, locationOnFailure, locationOnFallback) => Component => {
	class WithAuthorization extends React.Component {
		componentDidMount() {
			this.listener = this.props.firebase.onAuthUserListener(authUser => {
				if (!condition(authUser)) {
					this.props.history.replace(locationOnFailure);
				}
			}, () => {
				if(locationOnFallback){
					this.props.history.replace(locationOnFallback);
				}
			});
		}

		componentWillUnmount() {
			this.listener();
		}

		render() {
			return (
				<AuthUserContext.Consumer>
					{authUser =>
						condition(authUser) ? <Component {...this.props} /> : null
					}
				</AuthUserContext.Consumer>
			);
		}
	}

	return compose(
		withRouter,
		withFirebase,
	)(WithAuthorization);
};

export default withAuthorization;
