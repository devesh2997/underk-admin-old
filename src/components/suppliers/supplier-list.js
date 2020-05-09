import React, { Component } from 'react';
import { Button, Card, CardBody, CardHeader, Table } from 'reactstrap';
// import { withFirebase } from '../../firebase';

const DeleteSupplier = ({ sid, firebase }) => (
	<Button type="button"
		color="danger"
		onClick={() => {
			let isConfirmed = window.confirm('Are you sure you want to delete this supplier?');
			if(isConfirmed) {
				firebase.supplier(sid).delete();
			}
		}}
	>
		<i className="fa fa-trash"></i>
  	</Button>
);

class SupplierListBase extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false, suppliers: [],
		}
	}

	componentDidMount() {
		this.setState({ loading: true });

		this.unsubscribe = this.props.firebase
			.suppliers()
			.onSnapshot(snapshot => {
				let suppliers = [];

				snapshot.forEach(doc =>
					suppliers.push({ ...doc.data(), sid: doc.id }),
				);

				this.setState({
					suppliers,
					loading: false,
				});
			});
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	render() {
		const { suppliers, loading } = this.state;

		return (
			<Card>
				<CardHeader>
					<h4>Suppliers</h4>
				</CardHeader>
				<CardBody>
					{loading && <div className="animated fadeIn pt-3 text-center">Loading...</div>}
					<Table striped responsive>
						<thead>
							<tr>
								<th>#</th>
								<th>Supplier ID</th>
								<th>Name</th>
								<th>Address</th>
								<th>Email</th>
								<th>Phone</th>
								<th>SKU</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{suppliers.map((supplier, idx) => (
								<tr key={supplier.sid}>
									<td>{idx+1}</td>
									<td>{supplier.sid}</td>
									<td>{supplier.name}</td>
									<td>{supplier.address}</td>
									<td>{supplier.email}</td>
									<td>{supplier.phone}</td>
									<td>{supplier.sku}</td>
									<td><DeleteSupplier sid={supplier.sid} firebase={this.props.firebase} /></td>
								</tr>
							))}
						</tbody>
					</Table>
				</CardBody>
			</Card>
		);
	}
}

// export default withFirebase(SupplierListBase);
