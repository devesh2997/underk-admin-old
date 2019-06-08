import React from 'react';
import AuthUserContext from './context';
import { withFirebase } from '../firebase';
import { Alert, Button } from 'reactstrap';

const needsEmailVerification = authUser => authUser && !authUser.emailVerified && authUser.providerData.map(provider => provider.providerId).includes('password')

const withEmailVerification = Component => {
	class WithEmailVerification extends React.Component {
		constructor(props) {
			super(props);
			this.state = { isSent: false };
		}
		onSendEmailVerification = () => {
			this.props.firebase
			.doSendEmailVerification()
			.then(() => this.setState({ isSent: true }));
		}
		render() {
			return (
				<AuthUserContext.Consumer>
					{authUser =>
						needsEmailVerification(authUser) ? (
							<div>
								{this.state.isSent ? (
									<Alert color="success">
										Confirmation email sent: Check you Emails (Spam folder included) for a confirmation Email. Refresh this page once you confirmed your Email.
									</Alert>
									) : (
									<Alert color="info">
										Verify your Email: Check you Emails (Spam folder included) for a confirmation Email or send another confirmation Email.
									</Alert>
								)}
								<Button onClick={this.onSendEmailVerification} disabled={this.state.isSent} >
									Send Confirmation Email
								</Button>
							</div>
						) : (
							<Component {...this.props} />
					)}
				</AuthUserContext.Consumer>);
		}
	}
	return withFirebase(WithEmailVerification);
};

export default withEmailVerification;
