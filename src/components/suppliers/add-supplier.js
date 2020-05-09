import React, { Component } from 'react';
import { Alert, Button, Card, CardBody, CardHeader, Form, FormGroup, Input, Label } from 'reactstrap';
// import { withFirebase } from '../../firebase';
import ROUTES from '../../routes';

const INITIAL_STATE = {
	sid: '',
	name: '',
	address: '',
	sku: '',
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
		event.preventDefault();

		const { sid, name, address, sku, email, phone } = this.state;

		addSupplier(sid, name, address, sku, email, phone, this.props.firebase)
		.then(() => {
			this.props.history.push(ROUTES.SUPPLIER_LIST.path);
		})
		.catch(error => {
			this.setState({ error });
		});
	}

	onChange = event => {
		this.setState({ [event.target.name]: event.target.value });
	}

	render() {
		const { sid, name, address, sku, email, phone, error, loading } = this.state;

		const isInvalid = sid === '' || name === '' || address === '' || sku === '' || phone.length === 0 || email.length === 0;

		return (
			<Card>
				<CardHeader>
					<h4>Add supplier</h4>
				</CardHeader>
				<CardBody>
					{loading
						? <div className="animated fadeIn pt-3 text-center">Loading...</div>
						: <Form onSubmit={this.onSubmit}>
							<FormGroup>
								<Label>Supplier ID</Label>
								<Input type="text"
									name="sid"
									value={sid}
									onChange={this.onChange}
									placeholder="Enter supplier ID"
								/>
							</FormGroup>
							<FormGroup>
								<Label>Name / Title</Label>
								<Input type="text"
									name="name"
									value={name}
									onChange={this.onChange}
									placeholder="Enter name / title"
								/>
							</FormGroup>
							<FormGroup>
								<Label>Address</Label>
								<Input type="text"
									name="address"
									value={address}
									onChange={this.onChange}
									placeholder="Enter Address"
								/>
							</FormGroup>
							<FormGroup>
								<Label>SKU</Label>
								<Input type="text"
									name="sku"
									value={sku}
									onChange={this.onChange}
									placeholder="Enter SKU"
								/>
							</FormGroup>
							<FormGroup>
								<Label>Email(s)</Label>
								<Input type="email"
									name="email"
									value={email}
									onChange={this.onChange}
									placeholder="Enter email(s)"
									multiple
								/>
							</FormGroup>
							<FormGroup>
								<Label>Mobile number(s)</Label>
								<Input type="tel"
									name="phone"
									value={phone}
									onChange={this.onChange}
									placeholder="Enter mobile number(s)"
									multiple
								/>
							</FormGroup>

							<Button type="submit" color="primary" disabled={isInvalid}>
								Submit
							</Button>

							{error && <Alert color="danger">{error.message}</Alert>}
						</Form>
					}
				</CardBody>
			</Card>

		)
	}
}

// export default withFirebase(AddSupplierItemBase);
