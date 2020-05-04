import React, { Component } from 'react';
import {
	Alert,
	Button,
	Card,
	CardBody,
	CardHeader,
	Form,
	FormGroup,
	Input,
	Label
} from 'reactstrap';
import axios from 'axios';

export default class CreateInvoice extends Component {
	constructor(props) {
		super(props);

		this.state = {
			error: null,
			isLoading: false
		};
	}

	onSubmit = async event => {
		event.preventDefault();
		this.setState({ error: null, isLoading: true });

		let data = {
			orderId: event.target.orderId.value,
			orderTime: new Date(event.target.orderTime.value).getTime(),
			orderAddress: {
				name: event.target.name.value,
				building: event.target.building.value,
				locality: event.target.locality.value,
				city: event.target.city.value,
				state: event.target.state.value,
				pincode: event.target.pincode.value,
			},
			productSKU: event.target.productSKU.value,
			productQuantity: Number(event.target.productQuantity.value)
		}

		try {
			const url = 'https://us-central1-underk-firebase.cloudfunctions.net/adminApp/generateInvoiceWithExternalData';
			const response = await axios.post(url, data);
			if(!response.data.success) {
				throw new Error(response.data.message);
			}
			window.open(response.data.downloadURL);
		} catch(error) {
			this.setState({ error, isLoading: false });
		}
	}

	render() {
		const { error, isLoading } = this.state;

		return (
			<Card>
				<CardHeader>
					<h4>Create Invoice</h4>
				</CardHeader>
				<CardBody>
					<Form name="createInvoiceForm" onSubmit={this.onSubmit}>
						<FormGroup>
							<Label>Order ID</Label>
							<Input type="text"
								name="orderId"
								placeholder="Enter orderId"
								required
							/>
						</FormGroup>
						<FormGroup>
							<Label>Order Date</Label>
							<Input type="date"
								name="orderTime"
								required
							/>
						</FormGroup>
						<div
							style={{
								margin: '1rem -1.25rem',
								padding: '1rem 1.25rem',
								backgroundColor: '#e4e5e6'
							}}
						>
							<h5>Order Address</h5>
							<FormGroup>
								<Label>Name</Label>
								<Input type="text"
									name="name"
									placeholder="Enter name"
									required
								/>
							</FormGroup>
							<FormGroup>
								<Label>Building</Label>
								<Input type="text"
									name="building"
									placeholder="Enter building"
									required
								/>
							</FormGroup>
							<FormGroup>
								<Label>Locality</Label>
								<Input type="text"
									name="locality"
									placeholder="Enter locality"
									required
								/>
							</FormGroup>
							<FormGroup>
								<Label>City</Label>
								<Input type="text"
									name="city"
									placeholder="Enter city"
									required
								/>
							</FormGroup>
							<FormGroup>
								<Label>State</Label>
								<Input type="text"
									name="state"
									placeholder="Enter state"
									required
								/>
							</FormGroup>
							<FormGroup>
								<Label>Pincode</Label>
								<Input type="text"
									name="pincode"
									placeholder="Enter pincode"
									required
								/>
							</FormGroup>
						</div>
						<FormGroup>
							<Label>Product SKU</Label>
							<Input type="text"
								name="productSKU"
								placeholder="Enter productSKU"
								required
							/>
						</FormGroup>
						<FormGroup>
							<Label>Product Quantity</Label>
							<Input type="number"
								name="productQuantity"
								defaultValue="1"
								placeholder="Enter productQuantity"
								min="1"
								required
							/>
						</FormGroup>
						{error &&
							<Alert color="danger">{error.message}</Alert>
						}
						<FormGroup>
							<Button
								type="submit"
								color="primary"
								disabled={isLoading}
								style={{ marginRight: 10 }}
							>
								{isLoading
									? <i className='fa fa-refresh fa-spin fa-fw' />
									: 'Create'
								}
							</Button>
							<Button type="button"
								color="secondary"
								onClick={() => document.forms.createInvoiceForm.reset()}
							>
								Reset
							</Button>
						</FormGroup>
					</Form>
				</CardBody>
			</Card>
		);
	}
}
