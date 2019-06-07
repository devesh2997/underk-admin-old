import React, { Component } from 'react';
import { withFirebase } from '../../firebase';
import { Link } from 'react-router-dom';
import { adminRoutes as ROUTES } from '../../constants/routes';
import * as ROLES from '../../constants/roles';

class AdminListBase extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false, administrators: [],
		};
	}
	componentDidMount() {
		this.setState({ loading: true });

		this.unsubscribe = this.props.firebase
			.admins()
			.onSnapshot(snapshot => {
				let administrators = [];

				snapshot.forEach(doc => {
					administrators.push({ ...doc.data(), uid: doc.id });
				});

				this.setState({
					administrators,
					loading: false,
				});
			});
	}

	componentWillUnmount() {
		this.unsubscribe();
	}
	render() {
		const { administrators, loading } = this.state;
		return (
			<div>
				<div className="admn_pnl-secondary_heading">
					<h2>Administrators</h2>
					<Link to={ROUTES.ADD_ADMINISTRATOR.path}>
						<button>Add administrator</button>
					</Link>
				</div>
				{loading && <div>Loading ...</div>}
				<table className="admn_pnl-table">
					<thead>
						<tr>
							<th style={{ textAlign: 'center' }}>#</th>
							<th>ID</th>
							<th>Email</th>
							<th>Username</th>
							<th>Roles</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{administrators.map((administrator, idx) => (
							<tr key={administrator.uid}>
								<td style={{ textAlign: 'center' }}>{idx+1}</td>
								<td>{administrator.uid}</td>
								<td>{administrator.email}</td>
								<td>{administrator.username}</td>
								<td>{Object.keys(administrator.roles).join(', ')}</td>
								<td>
									<Link to={{ pathname: `${ROUTES.ADMINISTRATOR_LIST.path}/${administrator.uid}`, state: { administrator }, }}>Details</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}
}


class AdminItemBase extends Component {
	onSendPasswordResetEmail = () => { this.props.firebase.doPasswordReset(this.state.administrator.email); };
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			administrator: null,
			...props.location.state
		};
	}
	componentDidMount() {
		if (this.state.administrator) {
			return;
		}

		this.setState({ loading: true });

		this.unsubscribe = this.props.firebase
			.user(this.props.match.params.id)
			.onSnapshot(snapshot => {
				this.setState({
					administrator: snapshot.data(),
					loading: false,
				});
			});
	}

	componentWillUnmount() {
		this.unsubscribe && this.unsubscribe();
	}
	render() {
		const { administrator, loading } = this.state;
		return (
			<div>
				<div className="admn_pnl-secondary_heading">
					<h2>Administrator ({this.props.match.params.id})</h2>
				</div>
				{loading && <div>Loading ...</div>}
				{administrator && (
					<table className="admn_pnl-table">
						<tbody>
							<tr>
								<th scope="row">ID</th>
								<td>{administrator.uid}</td>
							</tr>
							<tr>
								<th scope="row">Email</th>
								<td>{administrator.email}</td>
							</tr>
							<tr>
								<th scope="row">Username</th>
								<td>{administrator.username}</td>
							</tr>
							<tr>
								<th scope="row">Action</th>
								<td>
									<button type="button" onClick={this.onSendPasswordResetEmail}>
										Send Password Reset
									</button>
								</td>
							</tr>
						</tbody>
					</table>
				)}
			</div>
		);
	}
}

const ERROR_CODE_ACCOUNT_EXISTS = 'auth/email-already-in-use';
const ERROR_MSG_ACCOUNT_EXISTS = ` An account with this E-Mail address already exists. Try to login with this account instead. If you think the account is already used from one of the social logins, try to sign-in with one of them. Afterward, associate your accounts on your personal account page. `;

const INITIAL_STATE = {
	username: "",
	email: "",
	passwordOne: "",
	passwordTwo: "",
	error: null
};

class AddAdminItemBase extends Component {
	constructor(props) {
		super(props);

		this.state = { ...INITIAL_STATE };
	}

	onSubmit = event => {
		event.preventDefault();

		const { username, email, passwordOne } = this.state;

		const roles = {};
		roles[ROLES.ADMIN] = ROLES.ADMIN;

		this.props.firebase
			.doCreateUserWithEmailAndPassword(email, passwordOne)
			.then(authUser => { // Create a user in your Firebase realtime database 
				return this.props.firebase
					.user(authUser.user.uid)
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
				this.setState({ ...INITIAL_STATE });
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
		const { username, email, passwordOne, passwordTwo, error } = this.state;
		const isInvalid =
			passwordOne !== passwordTwo
			|| passwordOne === ""
			|| email === ""
			|| username === "";
		
		return (
			<div>
				<div className="admn_pnl-secondary_heading">
					<h2>Add administrator</h2>
				</div>
				<form onSubmit={this.onSubmit} className="admn_pnl-form">
					<div>
						<label>Full Name</label>
						<input
							name="username"
							value={username}
							onChange={this.onChange}
							type="text"
							placeholder="Full Name"
						/>
					</div>
					<div>
						<label>Email Address</label>
						<input
							name="email"
							value={email}
							onChange={this.onChange}
							type="email"
							placeholder="Email Address"
						/>
					</div>
					<div>
						<label>Password</label>
						<input
							name="passwordOne"
							value={passwordOne}
							onChange={this.onChange}
							type="password"
							placeholder="Password"
						/>
					</div>
					<div>
						<label>Confirm Password</label>
						<input
							name="passwordTwo"
							value={passwordTwo}
							onChange={this.onChange}
							type="password"
							placeholder="Confirm Password"
						/>
					</div>
					
					<button disabled={isInvalid} type="submit" className="admn_pnl-button">
						Add Administrator
					</button>

					{error && <p>{error.message}</p>}
				</form>
			</div>
		);
	}
}

const AdminList = withFirebase(AdminListBase);
const AdminItem = withFirebase(AdminItemBase);
const AddAdminItem = withFirebase(AddAdminItemBase);


export { AdminList, AdminItem, AddAdminItem };
