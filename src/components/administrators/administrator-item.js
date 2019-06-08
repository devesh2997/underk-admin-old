import React, { Component } from 'react';
import { Button, Card, CardBody, CardHeader, Table } from 'reactstrap';
import { withFirebase } from '../../firebase';

class AdminItemBase extends Component {
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

	onSendPasswordResetEmail = () => { this.props.firebase.doPasswordReset(this.state.administrator.email); };

	render() {
		const { administrator, loading } = this.state;

		return (
			<Card>
				<CardHeader>
					<h4>Administrator ({this.props.match.params.id})</h4>
				</CardHeader>
				<CardBody>
					{loading && <div className="animated fadeIn pt-3 text-center">Loading...</div>}
					{administrator && (
						<Table striped responsive>
							<tbody>
								<tr>
									<th scope="row">ID</th>
									<td>{this.props.match.params.id}</td>
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

const AdminItem = withFirebase(AdminItemBase);
export default AdminItem
