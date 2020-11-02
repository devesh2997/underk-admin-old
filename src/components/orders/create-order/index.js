import React, { Component } from "react";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Form,
	FormGroup,
	Input,
	Label,
	InputGroup,
	InputGroupAddon,
	InputGroupButtonDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
	ListGroup,
	ListGroupItem,
	Badge,
} from "reactstrap";
import { withFirebase } from "../../../firebase";

const USER_SEARCH_KEYS = ["id", "mobile", "email"];
const PRODUCT_SEARCH_KEYS = ["id", "sku", "slug", "category"];

class CreateOrder extends Component {
	constructor(props) {
		super(props);

		this.state = {
			userSearchKey: "id",
			userSearchValue: "",
			isUSKDropdownOpen: false,

			users: [],
			selectedUser: "",
			loadingUsers: false,

			addresses: [],
			selectedAddress: "",
			loadingAddresses: false,

			categories: [],
			productSearchKey: "id",
			productSearchValue: "",
			isPSKDropdownOpen: false,

			products: [],
			selectedProducts: [],
			loadingProducts: false,
		};
	}

	componentDidMount() {
		this.props.firebase
			.categories()
			.get()
			.then((snapshot) => {
				let categories = [];
				snapshot.forEach((doc) =>
					categories.push({ ...doc.data(), cid: doc.id })
				);
				this.setState({ categories });
			});
	}

	toggleUSKDropdown = () => {
		this.setState((prevState) => ({
			isUSKDropdownOpen: !prevState.isUSKDropdownOpen,
		}));
	};

	togglePSKDropdown = () => {
		this.setState((prevState) => ({
			isPSKDropdownOpen: !prevState.isPSKDropdownOpen,
		}));
	};

	onChange = (event) => {
		this.setState({ [event.target.name]: event.target.value });
	};

	getUsers = () => {
		this.setState({ loadingUsers: true });
		if (this.state.userSearchKey === "id") {
			this.props.firebase
				.user(this.state.userSearchValue)
				.get()
				.then((doc) => {
					if (doc.exists) {
						let users = [];
						users.push({ ...doc.data(), id: doc.id });
						users = users.sort((a, b) => {
							if (!b.created_at) return -1;
							if (!a.created_at) return 1;
							if (a.created_at > b.created_at) {
								return -1;
							}
							if (a.created_at < b.created_at) {
								return 1;
							}
							return 0;
						});
						this.setState(
							{
								users,
								selectedUser:
									users.length > 0 ? users[0].id : "",
								loadingUsers: false,
							},
							this.getAddresses
						);
					}
				});
		} else {
			this.props.firebase
				.users()
				.where(
					this.state.userSearchKey,
					"==",
					this.state.userSearchValue
				)
				.get()
				.then((snapshot) => {
					let users = [];
					snapshot.forEach((doc) => {
						users.push({ ...doc.data(), id: doc.id });
					});
					users = users.sort((a, b) => {
						if (!b.created_at) return -1;
						if (!a.created_at) return 1;
						if (a.created_at > b.created_at) {
							return -1;
						}
						if (a.created_at < b.created_at) {
							return 1;
						}
						return 0;
					});
					this.setState(
						{
							users,
							selectedUser: users.length > 0 ? users[0].id : "",
							loadingUsers: false,
						},
						this.getAddresses
					);
				});
		}
	};

	getAddresses = () => {
		this.setState({ loadingAddresses: true });
		this.props.firebase
			.addresses()
			.where("uid", "==", this.state.selectedUser)
			.get()
			.then((snapshot) => {
				let addresses = [];
				snapshot.forEach((doc) => {
					addresses.push({ ...doc.data(), id: doc.id });
				});
				this.setState({
					addresses,
					selectedAddress:
						addresses.length > 0 ? addresses[0].id : "",
					loadingAddresses: false,
				});
			});
	};

	getProducts = () => {
		this.setState({ loadingProducts: true });
		if (this.state.productSearchKey === "sku") {
			this.props.firebase
				.productWithSku(this.state.productSearchValue)
				.get()
				.then((snapshot) => {
					let products = [];
					snapshot.forEach((doc) =>
						products.push({ ...doc.data(), id: doc.id })
					);
					this.setState({
						products,
						loadingProducts: false,
					});
				});
		} else if (this.state.productSearchKey === "category") {
			this.props.firebase
				.productsWithCategory(this.state.productSearchValue)
				.get()
				.then((snapshot) => {
					let products = [];
					snapshot.forEach((doc) =>
						products.push({ ...doc.data(), id: doc.id })
					);
					this.setState({
						products,
						loadingProducts: false,
					});
				});
		} else {
			this.props.firebase
				.products()
				.where(
					this.state.productSearchKey,
					"==",
					this.state.productSearchValue
				)
				.get()
				.then((snapshot) => {
					let products = [];
					snapshot.forEach((doc) =>
						products.push({ ...doc.data(), id: doc.id })
					);
					this.setState({
						products,
						loadingProducts: false,
					});
				});
		}
	};

	selectProduct = (product, sku, quantity) => {
		let p = this.state.selectedProducts.find((sp) => sp.sku === sku);
		if (p) return;
		// let selectedProduct = {};
		// selectedProduct["pid"] = product.id;
		// selectedProduct["title"] = product.title;
		// selectedProduct["slug"] = product.slug;
		// selectedProduct["listPrice"] = product.listPrice;
		// selectedProduct["discount"] = product.discount;
		// selectedProduct["taxPercent"] = product.taxPercent;
		// selectedProduct["isInclusiveTax"] = product.isInclusiveTax;

		// selectedProduct["category"] = {
		// 	cid: product.category.cid,
		// 	name: product.category.name,
		// 	slug: product.category.slug,
		// };
		// selectedProduct["gender"] = product.gender;

		// let productAsset =
		// 	Object.keys(product.assets).length > 0
		// 		? product.assets[Object.keys(product.assets)[0]]
		// 		: {};
		// selectedProduct["asset"] = {
		// 	url: productAsset.downloadURL,
		// 	contentType: productAsset.contentType,
		// };

		// selectedProduct["option"] = {
		// 	based_on: product.options.based_on,
		// 	name: product.options.skus[sku].name,
		// };

		// selectedProduct["attributes"] = product.attributes;

		this.setState((prevState) => ({
			selectedProducts: [
				...prevState.selectedProducts,
				{ sku, quantity, product },
			],
		}));
	};

	getQuantityOptions = (product, sku) => {
		let options = [];
		for (let i = 1; i <= product.options.skus[sku].lessThanTen; i++) {
			options.push(
				<option key={i} value={i}>
					{i}
				</option>
			);
		}
		return options;
	};

	handleQuantityChange = (sku, quantity) => {
		let sp = this.state.selectedProducts;
		sp.forEach((p, idx) => {
			if (p.sku === sku) {
				sp[idx].quantity = quantity;
			}
		});
		this.setState({ selectedProducts: sp });
	};

	removeProduct = (sku) => {
		this.setState((prevState) => ({
			selectedProducts: prevState.selectedProducts.filter(
				(p) => p.sku !== sku
			),
		}));
	};

	onSubmit = (event) => {
		event.preventDefault();
	};

	render() {
		const {
			isUSKDropdownOpen,
			userSearchKey,
			userSearchValue,
			loadingUsers,
			users,
			selectedUser,
			addresses,
			selectedAddress,
			isPSKDropdownOpen,
			productSearchKey,
			productSearchValue,
			loadingProducts,
			categories,
			products,
			selectedProducts,
		} = this.state;

		return (
			<Card>
				<CardHeader>
					<h4>Create Order</h4>
				</CardHeader>
				<CardBody>
					<Form onSubmit={this.onSubmit}>
						<FormGroup>
							<Label>Search users</Label>
							<InputGroup>
								<InputGroupButtonDropdown
									addonType="prepend"
									isOpen={isUSKDropdownOpen}
									toggle={this.toggleUSKDropdown}
								>
									<DropdownToggle caret>
										{userSearchKey}
									</DropdownToggle>
									<DropdownMenu>
										{USER_SEARCH_KEYS.map(
											(searchKey, idx) => (
												<DropdownItem
													key={idx}
													onClick={() =>
														this.setState({
															userSearchKey: searchKey,
														})
													}
												>
													{searchKey}
												</DropdownItem>
											)
										)}
									</DropdownMenu>
								</InputGroupButtonDropdown>
								<Input
									type="text"
									name="userSearchValue"
									value={userSearchValue}
									onChange={this.onChange}
									placeholder="Enter user id / mobile / email"
								/>
								<InputGroupAddon addonType="append">
									<Button
										type="button"
										color="primary"
										onClick={this.getUsers}
										disabled={loadingUsers}
									>
										{loadingUsers ? (
											<i className="fa fa-refresh fa-spin fa-fw" />
										) : (
											"Get"
										)}
									</Button>
								</InputGroupAddon>
							</InputGroup>
						</FormGroup>
						<FormGroup>
							<Label>Select user</Label>
							<ListGroup>
								{users.length > 0 ? (
									users.map((user) => (
										<ListGroupItem
											key={user.id}
											active={user.id === selectedUser}
											onClick={() =>
												this.setState(
													{
														selectedUser: user.id,
													},
													this.getAddresses
												)
											}
											style={{
												cursor: "pointer",
											}}
										>
											<div>{user.id}</div>
											{user.name ? (
												<div>{user.name}</div>
											) : null}
											<div>
												{user.mobile
													? user.mobile + ", "
													: ""}
												{user.email || ""}
											</div>
										</ListGroupItem>
									))
								) : (
									<ListGroupItem className="text-center">
										No user found.
									</ListGroupItem>
								)}
							</ListGroup>
						</FormGroup>
						<FormGroup>
							<Label>Select address</Label>
							{addresses.length > 0 ? (
								addresses.map((address) => (
									<ListGroupItem
										key={address.id}
										active={address.id === selectedAddress}
										onClick={() =>
											this.setState({
												selectedAddress: address.id,
											})
										}
										style={{
											cursor: "pointer",
										}}
									>
										<div>{address.name}</div>
										<div>
											{address.locality},{" "}
											{address.landmark
												? address.landmark + ", "
												: ""}
											{address.city}, {address.state} -{" "}
											{address.pincode}
										</div>
										<div>{address.mobile}</div>
									</ListGroupItem>
								))
							) : (
								<ListGroupItem className="text-center">
									No address found.
								</ListGroupItem>
							)}
						</FormGroup>
						<FormGroup>
							<Label>Search products</Label>
							<InputGroup>
								<InputGroupButtonDropdown
									addonType="prepend"
									isOpen={isPSKDropdownOpen}
									toggle={this.togglePSKDropdown}
								>
									<DropdownToggle caret>
										{productSearchKey}
									</DropdownToggle>
									<DropdownMenu>
										{PRODUCT_SEARCH_KEYS.map(
											(searchKey, idx) => (
												<DropdownItem
													key={idx}
													onClick={() =>
														this.setState({
															productSearchKey: searchKey,
														})
													}
												>
													{searchKey}
												</DropdownItem>
											)
										)}
									</DropdownMenu>
								</InputGroupButtonDropdown>
								<Input
									type="text"
									name="productSearchValue"
									value={productSearchValue}
									onChange={this.onChange}
									placeholder="Enter product id / sku / slug / category"
									list="categories"
								/>
								{productSearchKey === "category" ? (
									<datalist id="categories">
										{categories.map((c) => (
											<option
												key={c.slug}
												value={c.slug}
											/>
										))}
									</datalist>
								) : null}
								<InputGroupAddon addonType="append">
									<Button
										type="button"
										color="primary"
										onClick={this.getProducts}
										disabled={loadingProducts}
									>
										{loadingProducts ? (
											<i className="fa fa-refresh fa-spin fa-fw" />
										) : (
											"Get"
										)}
									</Button>
								</InputGroupAddon>
							</InputGroup>
						</FormGroup>
						<FormGroup>
							<Label>Select products</Label>
							<ListGroup>
								{products.length > 0 ? (
									products.map((product) => {
										const prdThumb =
											Object.keys(product.assets).length >
											0
												? product.assets[
														Object.keys(
															product.assets
														)[0]
												  ]
												: {};
										return (
											<ListGroupItem key={product.id}>
												<img
													src={prdThumb.downloadURL}
													alt={prdThumb.name}
													style={{
														height: "75px",
														verticalAlign: "top",
														marginRight: "1rem",
													}}
												/>
												<div
													style={{
														display: "inline-block",
													}}
												>
													<div>
														{product.title} (
														{product.category.name})
													</div>
													<div>
														Rs.{" "}
														{product.sellingPrice /
															100}{" "}
														/-
													</div>
													<div>
														{
															product.options
																.based_on
														}{" "}
														:{" "}
														{Object.keys(
															product.options.skus
														).map((sku) => (
															<Badge
																key={sku}
																color={
																	product
																		.options
																		.skus[
																		sku
																	].inStock
																		? "success"
																		: "danger"
																}
																style={{
																	margin:
																		"0 3px",
																	cursor:
																		"pointer",
																	fontSize:
																		"100%",
																}}
																onClick={() =>
																	this.selectProduct(
																		product,
																		sku,
																		1
																	)
																}
															>
																{
																	product
																		.options
																		.skus[
																		sku
																	].name
																}
															</Badge>
														))}
													</div>
												</div>
											</ListGroupItem>
										);
									})
								) : (
									<ListGroupItem className="text-center">
										No products found.
									</ListGroupItem>
								)}
							</ListGroup>
						</FormGroup>
						<FormGroup>
							<Label>Selected products</Label>
							<ListGroup>
								{selectedProducts.length > 0 ? (
									selectedProducts.map((selectedProduct) => {
										const prdThumb =
											Object.keys(
												selectedProduct.product.assets
											).length > 0
												? selectedProduct.product
														.assets[
														Object.keys(
															selectedProduct
																.product.assets
														)[0]
												  ]
												: {};
										return (
											<ListGroupItem
												key={selectedProduct.sku}
											>
												<img
													src={prdThumb.downloadURL}
													alt={prdThumb.name}
													style={{
														height: "75px",
														verticalAlign: "top",
														marginRight: "1rem",
													}}
												/>
												<div
													style={{
														display: "inline-block",
													}}
												>
													<div>
														{
															selectedProduct
																.product.title
														}{" "}
														(
														{
															selectedProduct
																.product
																.category.name
														}
														)
													</div>
													<div>
														Rs.{" "}
														{selectedProduct.product
															.sellingPrice /
															100}{" "}
														/-
													</div>
													<div>
														{
															selectedProduct
																.product.options
																.based_on
														}{" "}
														:{" "}
														{
															selectedProduct
																.product.options
																.skus[
																selectedProduct
																	.sku
															].name
														}
														, qty :{" "}
														<select
															name="quantity"
															value={
																selectedProduct.quantity
															}
															onChange={(e) =>
																this.handleQuantityChange(
																	selectedProduct.sku,
																	Number(
																		e.target
																			.value
																	)
																)
															}
														>
															{this.getQuantityOptions(
																selectedProduct.product,
																selectedProduct.sku
															)}
														</select>
													</div>
												</div>
												<Button
													type="button"
													color="danger"
													onClick={() =>
														this.removeProduct(
															selectedProduct.sku
														)
													}
												>
													<i className="fa fa-trash" />
												</Button>
											</ListGroupItem>
										);
									})
								) : (
									<ListGroupItem className="text-center">
										No products selected.
									</ListGroupItem>
								)}
							</ListGroup>
						</FormGroup>
					</Form>
				</CardBody>
			</Card>
		);
	}
}

export default withFirebase(CreateOrder);
