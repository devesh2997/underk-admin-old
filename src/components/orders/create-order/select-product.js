import React from "react";
import {
	Badge,
	Button,
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
	FormGroup,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupButtonDropdown,
	Label,
	ListGroup,
	ListGroupItem,
} from "reactstrap";
import { withFirebase } from "../../../firebase";

const SEARCH_KEYS = ["id", "sku", "slug", "category"];

class SelectProduct extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			categories: [],

			searchKey: "id",
			searchValue: "",
			isDropdownOpen: false,

			products: [],
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

	toggleDropdown = () => {
		this.setState((prevState) => ({
			isDropdownOpen: !prevState.isDropdownOpen,
		}));
	};

	onChange = (event) => {
		this.setState({ [event.target.name]: event.target.value });
	};

	getProducts = () => {
		this.setState({ loadingProducts: true });
		if (this.state.searchKey === "sku") {
			this.props.firebase
				.productWithSku(this.state.searchValue)
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
		} else if (this.state.searchKey === "category") {
			this.props.firebase
				.productsWithCategory(this.state.searchValue)
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
				.where(this.state.searchKey, "==", this.state.searchValue)
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

	render() {
		const {
			isDropdownOpen,
			searchKey,
			searchValue,
			categories,
			loadingProducts,
			products,
		} = this.state;
		const { selectedProducts } = this.props;

		return (
			<React.Fragment>
				<FormGroup>
					<Label>Search products</Label>
					<InputGroup>
						<InputGroupButtonDropdown
							addonType="prepend"
							isOpen={isDropdownOpen}
							toggle={this.toggleDropdown}
						>
							<DropdownToggle caret>{searchKey}</DropdownToggle>
							<DropdownMenu>
								{SEARCH_KEYS.map((key, idx) => (
									<DropdownItem
										key={idx}
										onClick={() =>
											this.setState({
												searchKey: key,
											})
										}
									>
										{key}
									</DropdownItem>
								))}
							</DropdownMenu>
						</InputGroupButtonDropdown>
						<Input
							type="text"
							name="searchValue"
							value={searchValue}
							onChange={this.onChange}
							placeholder="Enter product id / sku / slug / category"
							list="categories"
						/>
						{searchKey === "category" ? (
							<datalist id="categories">
								{categories.map((c) => (
									<option key={c.slug} value={c.slug} />
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
									Object.keys(product.assets).length > 0
										? product.assets[
												Object.keys(product.assets)[0]
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
												Rs. {product.sellingPrice / 100}{" "}
												/-
											</div>
											<div>
												{product.options.based_on} :{" "}
												{Object.keys(
													product.options.skus
												).map((sku) => (
													<Badge
														key={sku}
														color={
															product.options
																.skus[sku]
																.inStock
																? "success"
																: "danger"
														}
														style={{
															margin: "0 3px",
															cursor: "pointer",
															fontSize: "100%",
														}}
														onClick={() =>
															this.props.selectProduct(
																{
																	product,
																	sku,
																	quantity: 1,
																}
															)
														}
													>
														{
															product.options
																.skus[sku].name
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
									Object.keys(selectedProduct.product.assets)
										.length > 0
										? selectedProduct.product.assets[
												Object.keys(
													selectedProduct.product
														.assets
												)[0]
										  ]
										: {};
								return (
									<ListGroupItem key={selectedProduct.sku}>
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
												{selectedProduct.product.title}{" "}
												(
												{
													selectedProduct.product
														.category.name
												}
												)
											</div>
											<div>
												Rs.{" "}
												{selectedProduct.product
													.sellingPrice / 100}{" "}
												/-
											</div>
											<div>
												{
													selectedProduct.product
														.options.based_on
												}{" "}
												:{" "}
												{
													selectedProduct.product
														.options.skus[
														selectedProduct.sku
													].name
												}
												, qty :{" "}
												<select
													name="quantity"
													value={
														selectedProduct.quantity
													}
													onChange={(e) =>
														this.props.changeQuantity(
															selectedProduct.sku,
															Number(
																e.target.value
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
												this.props.unselectProduct(
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
			</React.Fragment>
		);
	}
}

export default withFirebase(SelectProduct);
