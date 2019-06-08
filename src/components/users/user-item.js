import React, { Component } from 'react';
import { Button, Card, CardBody, CardHeader, Table } from 'reactstrap';
import { withFirebase } from '../../firebase';

class UserItemBase extends Component {
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

	onSendPasswordResetEmail = () => { this.props.firebase.doPasswordReset(this.state.user.email); };

	render() {
		const { user, loading } = this.state;

		return (
			<Card>
				<CardHeader>
					<h4>User ({this.props.match.params.id})</h4>
				</CardHeader>
				<CardBody>
					{loading && <div className="animated fadeIn pt-3 text-center">Loading...</div>}
					{user && (
						<Table striped responsive>
							<tbody>
								<tr>
									<th scope="row">ID</th>
									<td>{this.props.match.params.id}</td>
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
										<Button type="button" color="primary" onClick={this.onSendPasswordResetEmail}>
											Send Password Reset
										</Button>
									</td>
								</tr>
							</tbody>
						</Table>
					)}
				</CardBody>
			</Card>
		);
	}
}

const UserItem = withFirebase(UserItemBase);
export default UserItem;
