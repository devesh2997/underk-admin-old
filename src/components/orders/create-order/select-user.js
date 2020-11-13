import React from "react";
import {
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

const SEARCH_KEYS = ["id", "mobile", "email"];

class SelectUser extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			searchKey: "id",
			searchValue: "",
			isDropdownOpen: false,

			users: [],
			loadingUsers: false,

			addresses: [],
			loadingAddresses: false,
		};
	}

	toggleDropdown = () => {
		this.setState((prevState) => ({
			isDropdownOpen: !prevState.isDropdownOpen,
		}));
	};

	onChange = (event) => {
		this.setState({ [event.target.name]: event.target.value });
	};

	getUsers = () => {
		this.setState({ loadingUsers: true });
		if (this.state.searchKey === "id") {
			this.props.firebase
				.user(this.state.searchValue)
				.get()
				.then((doc) => {
					if (doc.exists) {
						let users = [];
						users.push({ ...doc.data(), id: doc.id });
						this.setState({
							users,
							loadingUsers: false,
						});
						this.props.selectUser(
							users.length > 0 ? users[0] : null,
							this.getAddresses
						);
					}
				});
		} else {
			this.props.firebase
				.users()
				.where(this.state.searchKey, "==", this.state.searchValue)
				.get()
				.then((snapshot) => {
					let users = [];
					snapshot.forEach((doc) => {
						users.push({ ...doc.data(), id: doc.id });
					});
					this.setState({
						users,
						loadingUsers: false,
					});
					this.props.selectUser(
						users.length > 0 ? users[0] : null,
						this.getAddresses
					);
				});
		}
	};

	getAddresses = () => {
		if (!this.props.selectedUser) return;
		this.setState({ loadingAddresses: true });
		this.props.firebase
			.addresses()
			.where("uid", "==", this.props.selectedUser.id)
			.get()
			.then((snapshot) => {
				let addresses = [];
				snapshot.forEach((doc) => {
					addresses.push({ ...doc.data(), id: doc.id });
				});
				this.setState({
					addresses,
					loadingAddresses: false,
				});
				this.props.selectAddress(
					addresses.length > 0 ? addresses[0] : null
				);
			});
	};

	render() {
		const {
			isDropdownOpen,
			searchKey,
			searchValue,
			loadingUsers,
			users,
			addresses,
		} = this.state;
		const { selectedUser, selectedAddress } = this.props;

		return (
			<React.Fragment>
				<FormGroup>
					<Label>Search users</Label>
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
									active={
										!!selectedUser &&
										user.id === selectedUser.id
									}
									onClick={() =>
										this.props.selectUser(
											user,
											this.getAddresses
										)
									}
									style={{
										cursor: "pointer",
									}}
								>
									<div>{user.id}</div>
									{user.name ? <div>{user.name}</div> : null}
									<div>
										{user.mobile ? user.mobile + ", " : ""}
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
								active={
									!!selectedAddress &&
									address.id === selectedAddress.id
								}
								onClick={() =>
									this.props.selectAddress(address)
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
			</React.Fragment>
		);
	}
}

export default withFirebase(SelectUser);
