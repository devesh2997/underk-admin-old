import React, { Component } from "react";
import {
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	Container,
	Label,
	Button,
	InputGroup,
	Input,
	InputGroupAddon,
	InputGroupText,
	Col,
	Row,
	ListGroup,
	ListGroupItem,
	Collapse,
	Table,
} from "reactstrap";
import DatePicker from "react-datepicker";
import { withFirebase } from "../../firebase";
import { Link } from "react-router-dom";
import ROUTES from "../../routes";
import { addDays, timeStampToLocaleString, getAge } from "../../utils";
import "./style.css";
import { sendProductsInCartSMS } from "./utils";

class UserListBase extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			users: [],
			selectedUsers: [],
			sendingEmail: false,
			withStartDate: addDays(new Date(), -3),
			withEndDate: new Date(),
			emailSubject: "",
			emailBody: "",
			emailFrom: "no-reply@underk.in",
			sendingCartEmail: false,
		};
	}

	componentDidMount() {
		this.setState({ loading: true });

		const { withStartDate, withEndDate } = this.state;

		this.unsubscribe = this.props.firebase
			.usersWithStartAndEndDate(withStartDate, withEndDate)
			.onSnapshot(async (snapshot) => {
				let users = [];

				snapshot.forEach((doc) =>
					users.push({ ...doc.data(), uid: doc.id })
				);

				this.setState({
					users,
					loading: false,
				});
			});
	}

	handleStartDateChange = (date) => {
		this.setState({
			withStartDate: date,
			loading: true,
		});
		let { withStartDate, withEndDate } = this.state;
		this.unsubscribe = this.props.firebase
			.usersWithStartAndEndDate(withStartDate, withEndDate)
			.onSnapshot(async (snapshot) => {
				let users = [];

				snapshot.forEach((doc) =>
					users.push({ ...doc.data(), uid: doc.id })
				);

				this.setState({
					users,
					loading: false,
				});
			});
	};

	handleEndDateChange = (date) => {
		this.setState({
			withEndDate: date,
			loading: true,
		});
		let { withEndDate, withStartDate } = this.state;
		this.unsubscribe = this.props.firebase
			.usersWithStartAndEndDate(withStartDate, withEndDate)
			.onSnapshot(async (snapshot) => {
				let users = [];

				snapshot.forEach((doc) =>
					users.push({ ...doc.data(), uid: doc.id })
				);

				this.setState({
					users,
					loading: false,
				});
			});
	};

	componentWillUnmount() {
		this.unsubscribe();
	}

	onChange = (event) => {
		this.setState({ [event.target.name]: event.target.value });
	};

	onChecked = (event) => {
		let selectedUsers = this.state.selectedUsers;
		let isPresentAt = -1;
		for (let i = 0; i < selectedUsers.length; i++) {
			if (selectedUsers[i] === event.target.name) {
				isPresentAt = i;
				break;
			}
		}
		if (isPresentAt > -1) {
			selectedUsers.splice(isPresentAt, 1);
		} else {
			selectedUsers.push(event.target.name);
		}
		this.setState({ selectedUsers });
	};

	isChecked = (uid) => {
		let selectedUsers = this.state.selectedUsers;
		let isPresent = selectedUsers.find((s) => s === uid);
		return isPresent ? true : false;
	};

	selectAll = () => {
		if (this.state.selectedUsers.length === this.state.users.length) {
			return this.setState({ selectedUsers: [], sendingEmail: false });
		}
		let all = this.state.users.map((user) => user.uid);
		this.setState({ selectedUsers: all });
	};

	toggleSendingEmail = () => {
		this.setState({ sendingEmail: !this.state.sendingEmail });
	};

	sendProductInCartSMSToMultipleUsers = async () => {
		const { selectedUsers } = this.state;

		const usersMobile = [];

		for (let i = 0; i < selectedUsers.length; i++) {
			const uid = selectedUsers[i];
			const user = this.state.users.find((user) => user.uid === uid);
			if (user) {
				usersMobile.push(user.mobile);
			}
		}

		const flag = window.confirm(
			"Send sms to " + selectedUsers.length + " user/s ?"
		);

		if (flag) {
			this.setState({ loading: true });
			for (let i = 0; i < usersMobile.length; i++) {
				await sendProductsInCartSMS(
					usersMobile[i],
					this.props.firebase
				);
			}
			this.setState({ loading: false });
		}
	};

	sendEmail = () => {
		const {
			emailFrom,
			emailSubject,
			emailBody,
			selectedUsers,
		} = this.state;
		const flag = window.confirm(
			"Send email to " + selectedUsers.length + " user/s ?"
		);
		if (flag) {
			this.setState({ loading: true });
			this.props.firebase.db
				.collection("mail")
				.add({
					from: emailFrom,
					message: { subject: emailSubject, text: emailBody },
					bccUids: selectedUsers,
				})
				.then(() => {
					this.setState({ loading: false, sendingEmail: false });
				});
		}
	};

	sendCartEmail = async () => {
		this.setState({ sendingCartEmail: true });
		try {
			let products = [];
			let snapshot = await this.props.firebase.products().get();
			snapshot.forEach((doc) => {
				products.push({ ...doc.data(), pid: doc.id });
			});

			const { emailFrom, selectedUsers, users } = this.state;
			let carts = [];
			snapshot = await this.props.firebase.db.collection("carts").get();
			snapshot.forEach((doc) => {
				carts.push({ ...doc.data(), uid: doc.id });
			});
			carts = carts.filter((cart) => selectedUsers.includes(cart.uid));

			for (let i = 0; i < carts.length; i++) {
				let data = {
					name: "",
					products: [],
				};

				let user = users.find((user) => user.uid === carts[i].uid);
				if (user && user.name) {
					data.name = user.name;
				}

				let skus = carts[i].products
					? Object.keys(carts[i].products)
					: [];
				skus.forEach((sku) => {
					let product = products.find((prd) =>
						Object.keys(prd.options.skus).includes(sku)
					);
					if (product) {
						data.products.push({
							thumbnail: Object.values(product.assets)[0]
								.downloadURL,
							title: product.title,
							quantity: carts[i].products[sku].toString(),
							price: (
								Number(product.sellingPrice / 100) *
								Number(carts[i].products[sku])
							).toString(),
						});
					}
				});

				if (data.products.length > 0) {
					await this.props.firebase.db.collection("mail").add({
						from: emailFrom,
						template: {
							name: "reminder",
							data,
						},
						toUids: [carts[i].uid],
					});
				}
			}
		} catch (error) {
			console.log(error);
		}
		this.setState({ sendingCartEmail: false });
	};

	render() {
		const {
			users,
			loading,
			selectedUsers,
			sendingEmail,
			emailSubject,
			emailBody,
			emailFrom,
			withStartDate,
			withEndDate,
			sendingCartEmail,
		} = this.state;

		return (
			<Card>
				<CardHeader>
					<h4>Users</h4>
				</CardHeader>
				<CardBody>
					{loading && (
						<div className="animated fadeIn pt-3 text-center">
							Loading...
						</div>
					)}
					{selectedUsers.length > 0 && (
						<Row>
							<Col>
								<Button
									color={!sendingEmail ? "primary" : "danger"}
									onClick={this.toggleSendingEmail}
									style={{ margin: 5 }}
								>
									{sendingEmail ? "Cancel" : "Send Email"}
								</Button>
								<Button
									color="primary"
									onClick={this.sendCartEmail}
									style={{ margin: 5 }}
									disabled={sendingCartEmail}
								>
									{sendingCartEmail ? (
										<i className="fa fa-refresh fa-spin fa-fw" />
									) : (
										"Send Cart Email"
									)}
								</Button>
							</Col>
						</Row>
					)}
					{selectedUsers.length > 0 && sendingEmail && (
						<Container>
							<Row>
								<Col sm="2">From : </Col>
								<Col>
									<Input
										name="emailFrom"
										onChange={this.onChange}
										value={emailFrom}
										type="text"
									/>
								</Col>
							</Row>
							<Row>
								<Col sm="2">Suject : </Col>
								<Col>
									<Input
										name="emailSubject"
										onChange={this.onChange}
										value={emailSubject}
										type="text"
									/>
								</Col>
							</Row>
							<Row>
								<Col sm="2">Body : </Col>
								<Col>
									<Input
										name="emailBody"
										onChange={this.onChange}
										value={emailBody}
										type="textarea"
									/>
								</Col>
							</Row>
							<Row>
								<Col>
									<Button
										onClick={this.sendEmail}
										color="primary"
									>
										Send
									</Button>
								</Col>
							</Row>
						</Container>
					)}
					{!loading && (
						<Row>
							<Col>
								<InputGroup>
									<InputGroupAddon addonType="prepend">
										<InputGroupText>From</InputGroupText>
									</InputGroupAddon>
									<DatePicker
										endDate={withEndDate}
										selected={withStartDate}
										onChange={this.handleStartDateChange}
									/>
								</InputGroup>
							</Col>
							<Col>
								<InputGroup>
									<InputGroupAddon addonType="prepend">
										<InputGroupText>To</InputGroupText>
									</InputGroupAddon>
									<DatePicker
										endDate={withStartDate}
										selected={withEndDate}
										onChange={this.handleEndDateChange}
									/>
								</InputGroup>
							</Col>
						</Row>
					)}
					<Row>
						<Table striped responsive>
							<thead>
								<tr>
									<th
										onClick={this.selectAll}
										style={{
											color: "blue",
											cursor: "pointer",
										}}
									>
										All
									</th>
									<th>#</th>
									<th>ID</th>
									<th>Name</th>
									<th>Email</th>
									<th>Mobile</th>
									<th>Gender</th>
									<th>Age</th>
									<th>Created At</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{users.map((user, idx) => (
									<tr key={user.uid}>
										<td>
											<Input
												type="checkbox"
												name={user.uid}
												checked={this.isChecked(
													user.uid
												)}
												onChange={this.onChecked}
											/>
										</td>
										<td>{idx + 1}</td>
										<td>{user.uid}</td>
										<td>{user.name}</td>
										<td>
											{user.email}
											{user.isEmailVerified && (
												<i className="fa fa-check"></i>
											)}
										</td>
										<td>
											{user.mobile}
											{user.isMobileVerified && (
												<i className="fa fa-check"></i>
											)}
										</td>
										<td>{user.gender}</td>
										<td>{getAge(user.dob)}</td>
										<td>
											{timeStampToLocaleString(
												user.created_at
											)}
										</td>
										<td>
											<Link
												to={{
													pathname: `${ROUTES.USER_LIST.path}/${user.uid}`,
													state: { user },
												}}
											>
												Details
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					</Row>
				</CardBody>
			</Card>
		);
	}
}

const UserList = withFirebase(UserListBase);
export default UserList;
