import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Table } from 'reactstrap';
// import { withFirebase } from '../../firebase';

class SupplierItemBase extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			supplier: null,
			...props.location.state
		};
	}

	componentDidMount() {
		if (this.state.supplier) {
			return;
		}

		this.setState({ loading: true });

		this.unsubscribe = this.props.firebase
			.supplier(this.props.match.params.sid)
			.onSnapshot(snapshot => {
				this.setState({
					supplier: snapshot.data(),
					loading: false,
				});
			});
	}

	componentWillUnmount() {
		this.unsubscribe && this.unsubscribe();
	}

	render() {
		const { supplier, loading } = this.state;

		return (
			<Card>
				<CardHeader>
					<h4>Supplier ({this.props.match.params.sid})</h4>
				</CardHeader>
				<CardBody>
					{loading && <div className="animated fadeIn pt-3 text-center">Loading...</div>}
					{supplier && (
						<Table striped responsive>
							<tbody>
								<tr>
									<th scope="row">Supplier ID</th>
									<td>{this.props.match.params.sid}</td>
								</tr>
								<tr>
									<th scope="row">Name</th>
									<td>{supplier.name}</td>
								</tr>
								<tr>
									<th scope="row">Address</th>
									<td>{supplier.address}</td>
								</tr>
								<tr>
									<th scope="row">Email</th>
									<td>{supplier.email}</td>
								</tr>
								<tr>
									<th scope="row">Phone</th>
									<td>{supplier.phone}</td>
								</tr>
								<tr>
									<th scope="row">SKU</th>
									<td>{supplier.sku}</td>
								</tr>
							</tbody>
						</Table>
					)}
				</CardBody>
			</Card>
		);
	}
}

// export default withFirebase(SupplierItemBase);
