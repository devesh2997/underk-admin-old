import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Table } from 'reactstrap';
import { withFirebase } from '../../firebase';
import { Link } from 'react-router-dom';
import ROUTES from '../../routes';

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
			<Card>
				<CardHeader>
					<h4>Administrators</h4>
				</CardHeader>
				<CardBody>
					{loading && <div className="animated fadeIn pt-3 text-center">Loading...</div>}
					<Table striped responsive>
						<thead>
							<tr>
								<th>#</th>
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
									<td>{idx+1}</td>
									<td>{administrator.uid}</td>
									<td>{administrator.email}</td>
									<td>{administrator.username}</td>
									<td>{Object.values(administrator.roles).join(', ')}</td>
									<td>
										<Link to={{
											pathname: `${ROUTES.ADMINISTRATOR_LIST.path}/${administrator.uid}`,
											state: { administrator }
										}}>
											Details
										</Link>
									</td>
								</tr>
							))}
						</tbody>
					</Table>
				</CardBody>
			</Card>
		);
	}
}

const AdminList = withFirebase(AdminListBase);
export default AdminList;
