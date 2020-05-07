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
	Label,
	Row,
	Col
} from 'reactstrap';
import axios from 'axios';

const EVALUATE_PINCODE_URL = (pincode) => `https://us-central1-underk-firebase.cloudfunctions.net/publicApp/pincode?pincode=${pincode}`;
const CHECK_PINCODE_URL = (pincode) => `https://us-central1-underk-firebase.cloudfunctions.net/checkPincodeAvailability?pincode=${pincode}`;

const INITIAL_STATE = {
	city: '',
	state: '',
	products: [
		{ key: 1, sku: '', quantity: 1 },
	],
	error: null,
	isLoading: false
}

export default class CreateInvoice extends Component {
	constructor(props) {
		super(props);

		this.state = {
			...INITIAL_STATE
		};

		this.lastProductKey = 1;
	}

	onTextChange = event => {
		this.setState({
			[event.target.name]: event.target.value
		});
	}

	onPincodeChange = event => {
		const pincode = event.target.value;
		if(pincode.match(/^\d{6}$/)) {
			axios.get(EVALUATE_PINCODE_URL(pincode))
			.then(response => {
				// console.log(response);
				const { city, state } = response.data;
				this.setState({ city, state });
			})
			.catch(error => {
				// console.log(error);
			});

			axios.get(CHECK_PINCODE_URL(pincode))
			.then(response => {
				// console.log(response);
				if(response.data.invalid_pincode) {
					this.setState({
						error: new Error('Sorry, we are not currently delivering in your pincode area.')
					});
				}
			})
			.catch(error => {
				// console.log(error);
			});
		}
	}

	onProductInfoChange = (event, key) => {
		let products = Array.from(this.state.products);
		let targetIdx = products.findIndex(product => product.key === key);
		products[targetIdx] = {
			...products[targetIdx],
			[event.target.name]: event.target.value
		};
		this.setState({ products });
	}

	onProductDelete = key => {
		let products = Array.from(this.state.products);
		if(products.length <= 1) return;
		let targetIdx = products.findIndex(product => product.key === key);
		products.splice(targetIdx, 1);
		this.setState({ products });
	}

	onProductAdd = () => {
		let products = Array.from(this.state.products);
		this.lastProductKey++;
		products.push({
			key: this.lastProductKey,
			sku: '',
			quantity: 1
		});
		this.setState({ products });
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
			products: this.state.products
				.filter(product => product.sku.length > 0)
				.map(product => ({
					sku: product.sku,
					quantity: Number(product.quantity)
				})),
			additionalDiscount: Number(event.target.additionalDiscount.value)
		}
		console.log(data);
		try {
			// const url = 'http://localhost:5001/underk-firebase/us-central1/adminApp/generateInvoiceWithExternalData';
			const url = 'https://us-central1-underk-firebase.cloudfunctions.net/adminApp/generateInvoiceWithExternalData';
			const response = await axios.post(url, data);
			if(!response.data.success) {
				throw new Error(response.data.message);
			}
			console.log(response.data);
			window.open(response.data.invoice.downloadURL);
		} catch(error) {
			this.setState({ error });
		}
		this.setState({ isLoading: false });
	}

	render() {
		const { city, state, products, error, isLoading } = this.state;

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
								<Label>Pincode</Label>
								<Input type="text"
									name="pincode"
									placeholder="Enter pincode"
									onChange={this.onPincodeChange}
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
									value={city}
									placeholder="Enter city"
									onChange={this.onTextChange}
									required
								/>
							</FormGroup>
							<FormGroup>
								<Label>State</Label>
								<Input type="text"
									name="state"
									value={state}
									placeholder="Enter state"
									onChange={this.onTextChange}
									required
								/>
							</FormGroup>
						</div>
						<div>
							<h5>Products</h5>
							{products.map(product => (
								<Row
									key={product.key}
									style={{ alignItems: 'flex-end' }}
								>
									<Col sm={7}>
										<FormGroup>
											<Label>SKU</Label>
											<Input type="text"
												name="sku"
												value={product.sku}
												onChange={(e) => this.onProductInfoChange(e, product.key)}
												placeholder="Enter sku"
												required
											/>
										</FormGroup>
									</Col>
									<Col sm={3}>
										<FormGroup>
											<Label>Quantity</Label>
											<Input type="number"
												name="quantity"
												value={product.quantity}
												onChange={(e) => this.onProductInfoChange(e, product.key)}
												placeholder="Enter quantity"
												min="1"
												required
											/>
										</FormGroup>
									</Col>
									{products.length > 1
										? (
											<Col sm={2}>
												<FormGroup>
													<Button
														type="button"
														color="danger"
														onClick={() => this.onProductDelete(product.key)}
													>
														<i className="fa fa-trash" />
													</Button>
												</FormGroup>
											</Col>
										)
										: null
									}
								</Row>
							))}
							<FormGroup className="text-center">
								<Button
									type="button"
									color="secondary"
									onClick={this.onProductAdd}
								>
									<i className="fa fa-plus" />
								</Button>
							</FormGroup>
						</div>
						<FormGroup>
							<Label>Additional Discount (in paise)</Label>
							<Input type="number"
								name="additionalDiscount"
								defaultValue="0"
								placeholder="Enter additional discount"
								min="0"
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
								onClick={() => {
									document.forms.createInvoiceForm.reset();
									this.setState({
										...INITIAL_STATE
									});
									this.lastProductKey = 1;
								}}
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
