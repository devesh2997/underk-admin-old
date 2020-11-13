import React, { Component } from "react";
import {
	Card,
	CardHeader,
	CardBody,
	Form,
	Button,
	FormGroup,
	Label,
	Input,
} from "reactstrap";
import axios from "axios";
import types from "underk-types";
import { withFirebase } from "../../../firebase";
import SelectProduct from "./select-product";
import SelectUser from "./select-user";
import ROUTES from "../../../routes";

class CreateOrder extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedUser: null,
			selectedAddress: null,
			selectedProducts: [],

			loadingStrategies: true,
			delivery_charge: null,
			online_pay_discount: null,

			paymentMode: types.PAYMENT_MODE_COD,

			creatingOrder: false,
		};
	}

	componentDidMount() {
		this.props.firebase
			.strategies()
			.get()
			.then((doc) => {
				let delivery_charge = null,
					online_pay_discount = null;
				if (doc.exists) {
					const strategies = doc.data();
					delivery_charge = strategies.delivery_charge;
					online_pay_discount = strategies.online_pay_discount;
				}

				this.setState({
					loadingStrategies: false,
					delivery_charge,
					online_pay_discount,
				});
			});
	}

	componentWillUnmount() {
		this.unsubscribe && this.unsubscribe();
	}

	onChange = (event) => {
		this.setState({ [event.target.name]: event.target.value });
	};

	onSubmit = (event) => {
		event.preventDefault();

		const {
			selectedUser,
			selectedAddress,
			selectedProducts,
			loadingStrategies,
			delivery_charge,
			online_pay_discount,
			paymentMode,
		} = this.state;
		if (
			!selectedUser ||
			!selectedAddress ||
			selectedProducts.length === 0 ||
			loadingStrategies
		)
			return;

		let cart = {
				cartId: selectedUser.id,
				products: {},
			},
			mrp = 0,
			discount = 0,
			itemsCount = 0;

		selectedProducts.forEach((p) => {
			mrp += p.quantity * p.product.listPrice;
			discount += p.quantity * p.product.discount;
			itemsCount += p.quantity;

			let cartProduct = {};
			cartProduct["pid"] = p.product.id;
			cartProduct["title"] = p.product.title;
			cartProduct["slug"] = p.product.slug;
			cartProduct["listPrice"] = p.product.listPrice;
			cartProduct["discount"] = p.product.discount;
			cartProduct["taxPercent"] = p.product.taxPercent;
			cartProduct["isInclusiveTax"] = p.product.isInclusiveTax;
			cartProduct["category"] = {
				cid: p.product.category.cid,
				name: p.product.category.name,
				slug: p.product.category.slug,
			};
			cartProduct["gender"] = p.product.gender;
			let productAsset =
				Object.keys(p.product.assets).length > 0
					? p.product.assets[Object.keys(p.product.assets)[0]]
					: {};
			cartProduct["asset"] = {
				url: productAsset.downloadURL,
				contentType: productAsset.contentType,
			};
			cartProduct["option"] = {
				based_on: p.product.options.based_on,
				name: p.product.options.skus[p.sku].name,
			};
			cartProduct["attributes"] = p.product.attributes;

			cart["products"][p.sku] = {
				sku: p.sku,
				quantity: p.quantity,
				product: cartProduct,
			};
		});

		let address = Object.assign({}, selectedAddress);
		delete address.id;
		delete address.uid;

		let total = mrp - discount;

		let onlinePaymentDiscount = 0;
		let onlinePaymentDiscountApplied = false;
		if (
			paymentMode === types.PAYMENT_MODE_RAZORPAY &&
			online_pay_discount &&
			online_pay_discount.enabled
		) {
			if (total >= online_pay_discount.minOrderAmount) {
				onlinePaymentDiscount =
					(online_pay_discount.discountPercent * total) / 100;
				if (onlinePaymentDiscount > online_pay_discount.maxDiscount) {
					onlinePaymentDiscount = online_pay_discount.maxDiscount;
				}
				onlinePaymentDiscountApplied = true;
			}
		}

		const deliveryCharge = delivery_charge.charge;
		let deliveryChargeApplied = false;
		if (
			paymentMode === types.PAYMENT_MODE_COD &&
			!delivery_charge.free_if_cod
		) {
			deliveryChargeApplied = true;
		} else if (
			paymentMode === types.PAYMENT_MODE_RAZORPAY &&
			!delivery_charge.free_if_online
		) {
			deliveryChargeApplied = true;
		}

		total =
			total -
			(onlinePaymentDiscountApplied ? onlinePaymentDiscount : 0) +
			(deliveryChargeApplied ? deliveryCharge : 0);

		let summary = {
			mrp,
			discount,
			total,
			itemsCount,
		};
		if (onlinePaymentDiscountApplied) {
			summary.onlinePaymentDiscount = onlinePaymentDiscount;
			summary.onlinePaymentDiscountApplied = onlinePaymentDiscountApplied;
		}
		if (deliveryChargeApplied) {
			summary.deliveryCharge = deliveryCharge;
			summary.deliveryChargeApplied = deliveryChargeApplied;
		}

		console.log(summary);

		this.setState({ creatingOrder: true });

		axios({
			method: "post",
			url:
				"https://us-central1-underk-firebase.cloudfunctions.net/authUserApp/checkout",
			data: {
				cart,
				uid: selectedUser.id,
				address,
				paymentMode,
				summary,
			},
		})
			.then((response) => {
				console.log(response);
				this.getOrderStatus(response.data.orderId);
			})
			.catch((error) => {
				console.log(error);
			});
	};

	getOrderStatus = (orderId) => {
		this.unsubscribe = this.props.firebase
			.order(orderId)
			.onSnapshot((doc) => {
				if (doc.exists) {
					const order = { ...doc.data(), id: doc.id };
					if (order.status === types.ORDER_STATUS_PLACED) {
						this.props.history.push(ROUTES.ORDERS.path);
					}
				}
			});
	};

	render() {
		const {
			selectedUser,
			selectedAddress,
			selectedProducts,
			paymentMode,
			creatingOrder,
		} = this.state;

		return (
			<Card>
				<CardHeader>
					<h4>Create Order</h4>
				</CardHeader>
				<CardBody>
					<Form onSubmit={this.onSubmit}>
						<SelectUser
							selectedUser={selectedUser}
							selectUser={(user, cb) =>
								this.setState({ selectedUser: user }, cb)
							}
							selectedAddress={selectedAddress}
							selectAddress={(address) =>
								this.setState({ selectedAddress: address })
							}
						/>
						<SelectProduct
							selectedProducts={selectedProducts}
							selectProduct={(product) => {
								if (
									this.state.selectedProducts.find(
										(p) => p.sku === product.sku
									)
								) {
									return;
								}
								this.setState((prevState) => ({
									selectedProducts: [
										...prevState.selectedProducts,
										product,
									],
								}));
							}}
							unselectProduct={(sku) =>
								this.setState((prevState) => ({
									selectedProducts: prevState.selectedProducts.filter(
										(p) => p.sku !== sku
									),
								}))
							}
							changeQuantity={(sku, quantity) => {
								let sp = Array.from(selectedProducts);
								sp.forEach((p, idx) => {
									if (p.sku === sku) {
										sp[idx].quantity = quantity;
									}
								});
								this.setState({ selectedProducts: sp });
							}}
						/>
						<FormGroup>
							<Label>Payment Mode</Label>
							<Input
								type="select"
								name="paymentMode"
								value={paymentMode}
								onChange={this.onChange}
								required
							>
								<option value={types.PAYMENT_MODE_COD}>
									{types.PAYMENT_MODE_COD}
								</option>
								<option value={types.PAYMENT_MODE_RAZORPAY}>
									{types.PAYMENT_MODE_RAZORPAY}
								</option>
							</Input>
						</FormGroup>
						<FormGroup className="text-center">
							<Button type="submit" disabled={creatingOrder}>
								{creatingOrder ? (
									<i className="fa fa-refresh fa-spin fa-fw" />
								) : (
									"Create Order"
								)}
							</Button>
						</FormGroup>
					</Form>
				</CardBody>
			</Card>
		);
	}
}

export default withFirebase(CreateOrder);
