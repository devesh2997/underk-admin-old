import React, { Component } from 'react';
import { withFirebase } from '../../firebase';
import { adminRoutes as ROUTES } from '../../constants/routes';
import { Link } from 'react-router-dom';

const DeleteSupplier = ({ sid, firebase }) => (
	<button type="button"
		onClick={() => {
			let isConfirmed = window.confirm('Are you sure you want to delete this supplier?');
			if(isConfirmed) {
				firebase.supplier(sid).delete();
			}
		}}
	>
		Delete
  	</button>
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
			<div>
				<div className="admn_pnl-secondary_heading">
					<h2>Suppliers</h2>
					<Link to={ROUTES.ADD_SUPPLIER.path}>
						<button>Add supplier</button>
					</Link>
				</div>
				{loading && <div>Loading ...</div>}
				<table className="admn_pnl-table">
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
				</table>
			</div>
		);
	}
}

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
			<div>
				<div className="admn_pnl-secondary_heading">
					<h2>Supplier ({this.props.match.params.sid})</h2>
				</div>
				{loading && <div>Loading ...</div>}
				{supplier && (
					<table className="admn_pnl-table">
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
					</table>
				)}
			</div>
		);
	}
}

const INITIAL_STATE = {
	sid: "",
	name: "",
	address: "",
	sku: "",
	email: [],
	phone: [],
	loading: false,
	error: null
};

const addSupplier = (sid, name, address, sku, email, phone, firebase) => {

	return firebase.supplier(sid).set({
		name,
		address,
		sku,
		email,
		phone,
	});
}

class AddSupplierItemBase extends Component {
	constructor(props) {
		super(props);

		this.state = { ...INITIAL_STATE };
	}

	onSubmit = event => {
		const { sid, name, address, sku, email, phone } = this.state;


		addSupplier(sid, name, address, sku, email, phone, this.props.firebase).then((value) => {
			this.setState({ ...INITIAL_STATE });
			this.props.history.push(ROUTES.SUPPLIER_LIST.path);
		})
			.catch(error => {
				this.setState({ error });
			});
		event.preventDefault();
	}

	onChange = event => {
		this.setState({ [event.target.name]: event.target.value });
	}

	render() {
		const { sid, name, address, sku, email, phone, error, loading } = this.state;

		const isInvalid = sid === "" || name === "" || address === "" || sku === "" || phone.length == 0 || email.length == 0;

		return (
			<div>
				<div className="admn_pnl-secondary_heading">
					<h2>Add supplier</h2>
				</div>
				{loading
					? <div>Loading ...</div>
					: <form onSubmit={this.onSubmit} className="admn_pnl-form">
						<div>
							<label>Supplier ID</label>
							<input
								name="sid"
								value={sid}
								onChange={this.onChange}
								type="text"
								placeholder="Supplier ID"
							/>
						</div>
						<div>
							<label>Name / Title</label>
							<input
								name="name"
								value={name}
								onChange={this.onChange}
								type="text"
								placeholder="Name / Title"
							/>
						</div>
						<div>
							<label>Address</label>
							<input
								name="address"
								value={address}
								onChange={this.onChange}
								type="text"
								placeholder="Address"
							/>
						</div>
						<div>
							<label>SKU</label>
							<input
								name="sku"
								value={sku}
								onChange={this.onChange}
								type="text"
								placeholder="SKU"
							/>
						</div>
						<div>
							<label>Email</label>
							<input
								name="email"
								value={email}
								onChange={this.onChange}
								type="email"
								placeholder="Email"
								multiple
							/>
						</div>
						<div>
							<label>Mobile numbers</label>
							<input
								name="phone"
								value={phone}
								onChange={this.onChange}
								type="tel"
								placeholder="Mobile numbers"
								multiple
							/>
						</div>

						<button disabled={isInvalid} type="submit" className="admn_pnl-button">
							Submit
						</button>

						{error && <p>{error.message}</p>}
					</form>
				}
			</div>

		)
	}
}


const SupplierList = withFirebase(SupplierListBase);
const SupplierItem = withFirebase(SupplierItemBase);
const AddSupplierItem = withFirebase(AddSupplierItemBase);

export { SupplierList, SupplierItem, AddSupplierItem, addSupplier };
