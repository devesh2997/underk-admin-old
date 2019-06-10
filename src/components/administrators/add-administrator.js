import React, { Component } from 'react';
import { Alert, Button, Card, CardBody, CardHeader, Form, FormGroup, Input, Label } from 'reactstrap';
import { withFirebase } from '../../firebase';
import ROUTES from '../../routes';
import { ROLES } from '../../constants';



const ERROR_CODE_ACCOUNT_EXISTS = 'auth/email-already-in-use';
const ERROR_MSG_ACCOUNT_EXISTS = ` An account with this E-Mail address already exists. Try to login with this account instead. If you think the account is already used from one of the social logins, try to sign-in with one of them. Afterward, associate your accounts on your personal account page. `;

const INITIAL_STATE = {
	username: '',
	email: '',
	password: '',
	confirmPassword: '',
	error: null
};

class AddAdminItemBase extends Component {
	constructor(props) {
		super(props);

		this.state = { ...INITIAL_STATE };
	}

	onSubmit = event => {
		event.preventDefault();
		this.setState({ error: null })

		const { username, email, password } = this.state;

		const roles = {};
		roles[ROLES.ADMIN] = ROLES.ADMIN;

		this.props.firebase
			.doCreateUserWithEmailAndPassword(email, password)
			.then(authUser => { // Create a user in your Firebase realtime database
				return this.props.firebase
					.admin(authUser.user.uid)
					.set(
					{
						username,
						email,
						roles,
					},
					{ merge: true });
			})
			.then(() => {
				return this.props.firebase.doSendEmailVerification();
			})
			.then(() => {
				this.props.history.push(ROUTES.ADMINISTRATOR_LIST.path);
			})
			.catch(error => {
				if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
					error.message = ERROR_MSG_ACCOUNT_EXISTS;
				}
				this.setState({ error });
			});
	};

	onChange = event => {
		this.setState({ [event.target.name]: event.target.value });
	};

	render() {
		const { username, email, password, confirmPassword, error } = this.state;

		const isInvalid = password !== confirmPassword || password === '' || email === '' || username === '';

		return (
			<Card>
				<CardHeader>
					<h4>Add administrator</h4>
				</CardHeader>
				<CardBody>
					<Form onSubmit={this.onSubmit}>
						<FormGroup>
							<Label>Full name</Label>
							<Input type="text"
								name="username"
								value={username}
								onChange={this.onChange}
								placeholder="Enter full name"
							/>
						</FormGroup>
						<FormGroup>
							<Label>Email address</Label>
							<Input type="email"
								name="email"
								value={email}
								onChange={this.onChange}
								placeholder="Enter email address"
							/>
						</FormGroup>
						<FormGroup>
							<Label>Password</Label>
							<Input type="password"
								name="password"
								value={password}
								onChange={this.onChange}
								placeholder="Enter password"
							/>
						</FormGroup>
						<FormGroup>
							<Label>Confirm password</Label>
							<Input type="password"
								name="confirmPassword"
								value={confirmPassword}
								onChange={this.onChange}
								placeholder="Enter confirm password"
							/>
						</FormGroup>

						<Button type="submit" color="primary" disabled={isInvalid}>
							Add Administrator
						</Button>

						{error && <Alert color="danger">{error.message}</Alert>}
					</Form>
				</CardBody>
			</Card>
		);
	}
}

const AddAdminItem = withFirebase(AddAdminItemBase);
export default AddAdminItem;
