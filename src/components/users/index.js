//TODO specific routing for userlist not working when url is typed in browser.
import React, { Component } from 'react';
import { withFirebase } from '../../firebase';
import { Link } from 'react-router-dom';
import { adminRoutes as ROUTES } from '../../constants/routes';

class UserListBase extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false, users: [],
		};
	}
	componentDidMount() {
		this.setState({ loading: true });

		this.unsubscribe = this.props.firebase
			.users().where("roles", "==", {})
			.onSnapshot(snapshot => {
				let users = [];

				snapshot.forEach(doc =>
					users.push({ ...doc.data(), uid: doc.id }),
				);

				this.setState({
					users,
					loading: false,
				});
			});
	}

	componentWillUnmount() {
		this.unsubscribe();
	}
	render() {
		const { users, loading } = this.state;
		return (
			<div>
				<div className="admn_pnl-secondary_heading">
					<h2>Users</h2>
				</div>
				{loading && <div>Loading ...</div>}
				<table className="admn_pnl-table">
					<thead>
						<tr>
							<th>#</th>
							<th>ID</th>
							<th>Email</th>
							<th>Username</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{users.map((user, idx) => (
							<tr key={user.uid}>
								<td>{idx+1}</td>
								<td>{user.uid}</td>
								<td>{user.email}</td>
								<td>{user.username}</td>
								<td>
									<Link to={{ pathname: `${ROUTES.USER_LIST.path}/${user.uid}`, state: { user }, }}>Details</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}
}


class UserItemBase extends Component {
	onSendPasswordResetEmail = () => { this.props.firebase.doPasswordReset(this.state.user.email); };
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			user: null,
			...props.location.state
		};
	}
	componentDidMount() {
		if (this.state.user) {
			return;
		}

		this.setState({ loading: true });

		this.unsubscribe = this.props.firebase
			.user(this.props.match.params.id)
			.onSnapshot(snapshot => {
				this.setState({
					user: snapshot.data(),
					loading: false,
				});
			});
	}

	componentWillUnmount() {
		this.unsubscribe && this.unsubscribe();
	}
	render() {
		const { user, loading } = this.state;
		return (
			<div>
				<div className="admn_pnl-secondary_heading">
					<h2>User ({this.props.match.params.id})</h2>
				</div>
				{loading && <div>Loading ...</div>}
				{user && (
					<table className="admn_pnl-table">
						<tbody>
							<tr>
								<th scope="row">ID</th>
								<td>{user.uid}</td>
							</tr>
							<tr>
								<th scope="row">Email</th>
								<td>{user.email}</td>
							</tr>
							<tr>
								<th scope="row">Username</th>
								<td>{user.username}</td>
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


const UserList = withFirebase(UserListBase);
const UserItem = withFirebase(UserItemBase);


export { UserList, UserItem };
