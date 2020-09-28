import React, { Component } from "react";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Col,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	Row,
	Table,
} from "reactstrap";
import { withFirebase } from "../../firebase";
import { addDays, timeStampToDateLocaleString } from "../../utils";
import DatePicker from "react-datepicker";
import ROUTES from "../../routes";

import "./style.css";

export const CouponItem = ({ coupon, history, firebase }) => {
	return (
		<tr>
			<td>{coupon.title}</td>
			<td>{coupon.discountPercent}%</td>
			<td>{timeStampToDateLocaleString(coupon.startTime)}</td>
			<td>{timeStampToDateLocaleString(coupon.endTime)}</td>
			<td>&#8377;{coupon.minOrderAmount / 100}</td>
			<td>&#8377;{coupon.maxDiscount / 100}</td>
			<td>{coupon.description}</td>
			<td>
				<Button
					color="secondary"
					onClick={() => {
						history.push(
							`${ROUTES.COUPON_LIST.path}/${coupon.cid}/edit`,
							{ coupon }
						);
					}}
					style={{ margin: "5px" }}
				>
					<i className="fa fa-pencil" />
				</Button>
				<Button
					color="danger"
					onClick={() => {
						let isConfirmed = window.confirm(
							"Are you sure you want to delete this coupon?"
						);
						if (isConfirmed) {
							firebase
								.coupon(coupon.cid)
								.delete()
								.catch((error) => console.log(error));
						}
					}}
					style={{ margin: "5px" }}
				>
					<i className="fa fa-trash" />
				</Button>
			</td>
		</tr>
	);
};

class CouponList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			coupons: [],
			withStartDate: addDays(new Date(), -30),
			withEndDate: new Date(),
		};
	}

	componentDidMount() {
		this.setState({ loading: true });
		const { withStartDate, withEndDate } = this.state;
		this.unsubscribe = this.props.firebase
			.couponsWithStartAndEndDate(withStartDate, withEndDate)
			.onSnapshot((snapshot) => {
				let coupons = [];

				snapshot.forEach((doc) => {
					coupons.push({ ...doc.data(), cid: doc.id });
				});

				this.setState({
					coupons,
					loading: false,
				});
			});
	}

	componentWillUnmount() {
		this.unsubscribe && this.unsubscribe();
	}

	handleStartDateChange = (date) => {
		this.setState({
			withStartDate: date,
			loading: true,
		});
		let { withEndDate } = this.state;

		this.unsubscribe && this.unsubscribe();
		this.unsubscribe = this.props.firebase
			.couponsWithStartAndEndDate(date, withEndDate)
			.onSnapshot((snapshot) => {
				let coupons = [];

				snapshot.forEach((doc) => {
					coupons.push({ ...doc.data(), cid: doc.id });
				});

				this.setState({
					coupons,
					loading: false,
				});
			});
	};

	handleEndDateChange = (date) => {
		this.setState({
			withEndDate: date,
			loading: true,
		});
		let { withStartDate } = this.state;

		this.unsubscribe && this.unsubscribe();
		this.unsubscribe = this.props.firebase
			.couponsWithStartAndEndDate(withStartDate, date)
			.onSnapshot((snapshot) => {
				let coupons = [];

				snapshot.forEach((doc) => {
					coupons.push({ ...doc.data(), cid: doc.id });
				});

				this.setState({
					coupons,
					loading: false,
				});
			});
	};

	render() {
		const { coupons, loading, withStartDate, withEndDate } = this.state;

		return (
			<Card>
				<CardHeader>
					<Row>
						<Col md={6}>
							<h4 style={{ marginBottom: "0.5rem" }}>Coupons</h4>
						</Col>
						<Col md={6}>
							<Row>
								<Col>
									<InputGroup>
										<InputGroupAddon addonType="prepend">
											<InputGroupText>
												From
											</InputGroupText>
										</InputGroupAddon>
										<DatePicker
											maxDate={withEndDate}
											selected={withStartDate}
											onChange={
												this.handleStartDateChange
											}
										/>
									</InputGroup>
								</Col>
								<Col>
									<InputGroup>
										<InputGroupAddon addonType="prepend">
											<InputGroupText>To</InputGroupText>
										</InputGroupAddon>
										<DatePicker
											minDate={withStartDate}
											selected={withEndDate}
											onChange={this.handleEndDateChange}
										/>
									</InputGroup>
								</Col>
							</Row>
						</Col>
					</Row>
				</CardHeader>
				<CardBody>
					{loading && (
						<div className="animated fadeIn pt-3 text-center">
							Loading...
						</div>
					)}
					<Table striped responsive>
						<thead>
							<tr>
								<th>Title</th>
								<th>Discount</th>
								<th>Start Time</th>
								<th>End Time</th>
								<th>Min Order Amount</th>
								<th>Max Discount</th>
								<th>Description</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{coupons.map((coupon) => (
								<CouponItem
									key={coupon.cid}
									coupon={coupon}
									{...this.props}
								/>
							))}
						</tbody>
					</Table>
				</CardBody>
			</Card>
		);
	}
}

export default withFirebase(CouponList);
