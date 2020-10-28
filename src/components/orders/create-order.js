import React, { Component } from "react";
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
	Col,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
} from "reactstrap";
import { withFirebase } from "../../firebase";
import ROUTES from "../../routes";

class CreateOrder extends Component {
	constructor(props) {
		super(props);

		this.state = {
			searchType: "mobile",
			searchValue: "",
			loadingUser: false,
			user: null,
			categories: [],
			withCategory: "",
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

	onSubmit = (event) => {
		event.preventDefault();
	};

	onChange = (event) => {
		this.setState({ [event.target.name]: event.target.value });
	};

	getUser = () => {
		this.setState({ loadingUser: true });
		if (this.state.searchType === "id") {
			this.props.firebase
				.user(this.state.searchValue)
				.get()
				.then((doc) => {
					if (doc.exists) {
						let user = { ...doc.data(), id: doc.id };
						this.setState({ user, loadingUser: false });
					}
				});
		} else {
			this.props.firebase
				.users()
				.where("mobile", "==", this.state.searchValue)
				.where("isMobileVerified", "==", true)
				.get()
				.then((snapshot) => {
					let user = null;
					snapshot.forEach((doc) => {
						user = { ...doc.data(), id: doc.id };
					});
					this.setState({ user, loadingUser: false });
				});
		}
	};

	getProducts = () => {
		this.setState({ loadingProducts: true });
		this.props.firebase
			.productsWithCategory(this.state.withCategory)
			.get()
			.then((snapshot) => {
				let products = [];
				snapshot.forEach((doc) =>
					products.push({ ...doc.data(), pid: doc.id })
				);
				console.log(products);
				this.setState({
					products,
					loadingProducts: false,
				});
			});
	};

	render() {
		const {
			searchType,
			searchValue,
			loadingUser,
			user,
			categories,
			withCategory,
			loadingProducts,
		} = this.state;

		return (
			<Card>
				<CardHeader>
					<h4>Create Order</h4>
				</CardHeader>
				<CardBody>
					<Form onSubmit={this.onSubmit}>
						<FormGroup>
							<Row>
								<Col sm={2}>
									<Input
										type="select"
										name="searchType"
										value={searchType}
										onChange={this.onChange}
									>
										<option value="mobile">mobile</option>
										<option value="id">id</option>
									</Input>
								</Col>
								<Col>
									<Input
										type="text"
										name="searchValue"
										value={searchValue}
										onChange={this.onChange}
										placeholder="Enter user id / mobile"
									/>
								</Col>
								<Col sm={2}>
									<Button
										type="button"
										color="primary"
										onClick={this.getUser}
										disabled={loadingUser}
									>
										{loadingUser ? (
											<i className="fa fa-refresh fa-spin fa-fw" />
										) : (
											"Get"
										)}
									</Button>
								</Col>
							</Row>
						</FormGroup>
						<FormGroup>
							<Label>User</Label>
							<Input
								type="text"
								value={
									user
										? user.name + " (" + user.id + ")"
										: "No such user found"
								}
								disabled
							/>
						</FormGroup>
						<FormGroup>
							<Row>
								<Col>
									<InputGroup>
										<InputGroupAddon addonType="prepend">
											<InputGroupText>
												Category
											</InputGroupText>
										</InputGroupAddon>
										<Input
											type="select"
											name="withCategory"
											value={withCategory}
											onChange={this.onChange}
										>
											<option value="all">all</option>
											{categories.map((c) => (
												<option
													key={c.id}
													value={c.cid}
												>
													{c.cid}
												</option>
											))}
										</Input>
									</InputGroup>
								</Col>
								<Col sm={2}>
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
								</Col>
							</Row>
						</FormGroup>
					</Form>
				</CardBody>
			</Card>
		);
	}
}

export default withFirebase(CreateOrder);
