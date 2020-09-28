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
} from "reactstrap";
import { withFirebase } from "../../firebase";
import ROUTES from "../../routes";
import { addDays } from "../../utils";
import DatePicker from "react-datepicker";

class CouponForm extends Component {
	constructor(props) {
		super(props);

		let coupon = {};
		if (props.location.state && props.location.state.coupon) {
			coupon = props.location.state.coupon;
			coupon.startTime = new Date(coupon.startTime);
			coupon.endTime = new Date(coupon.endTime);
			delete coupon.cid;
		}

		this.state = {
			title: "",
			discountPercent: "",
			startTime: new Date(),
			endTime: addDays(new Date(), 30),
			minOrderAmount: "",
			maxDiscount: "",
			description: "",
			error: null,
			loading: false,
			...coupon,
		};
	}

	componentDidMount() {
		if (this.props.match.params.cid && !(this.props.location.state && this.props.location.state.coupon)) {
			this.props.firebase
				.coupon(this.props.match.params.cid)
				.get()
				.then((doc) => {
					if (!doc.exists) {
						throw new Error("Coupon not found!");
					}
					let coupon = doc.data();
					coupon.startTime = new Date(coupon.startTime);
					coupon.endTime = new Date(coupon.endTime);
					this.setState({ ...coupon });
				})
				.catch((error) => {
					console.log(error);
					this.props.history.push(ROUTES.COUPON_LIST.path);
				});
		}
	}

	onChange = (event) => {
		this.setState({ [event.target.name]: event.target.value });
	};

	onSubmit = (event) => {
		event.preventDefault();
		this.setState({ error: null, loading: true });

		const {
			title,
			discountPercent,
			startTime,
			endTime,
			minOrderAmount,
			maxDiscount,
			description,
		} = this.state;

		if (this.props.match.params.cid) {
			this.props.firebase
				.coupon(this.props.match.params.cid)
				.set(
					{
						title,
						discountPercent: Number(discountPercent),
						startTime: startTime.getTime(),
						endTime: endTime.getTime(),
						minOrderAmount: Number(minOrderAmount),
						maxDiscount: Number(maxDiscount),
						description,
					},
					{ merge: true }
				)
				.then(() => {
					this.props.history.push(ROUTES.COUPON_LIST.path);
				})
				.catch((error) => {
					this.setState({ error });
				});
		} else {
			this.props.firebase
				.coupons()
				.add({
					title,
					discountPercent: Number(discountPercent),
					startTime: startTime.getTime(),
					endTime: endTime.getTime(),
					minOrderAmount: Number(minOrderAmount),
					maxDiscount: Number(maxDiscount),
					description,
				})
				.then(() => {
					this.props.history.push(ROUTES.COUPON_LIST.path);
				})
				.catch((error) => {
					this.setState({ error });
				});
		}
	};

	render() {
		const {
			title,
			discountPercent,
			startTime,
			endTime,
			minOrderAmount,
			maxDiscount,
			description,
			error,
			loading,
		} = this.state;

		return (
			<Card>
				<CardHeader>
					<h4>Add/Edit Coupon</h4>
				</CardHeader>
				<CardBody>
					<Form onSubmit={this.onSubmit}>
						<FormGroup>
							<Label>Title</Label>
							<Input
								type="text"
								name="title"
								value={title}
								onChange={this.onChange}
								placeholder="Enter title"
								required
							/>
						</FormGroup>
						<FormGroup>
							<Label>Discount (in %)</Label>
							<Input
								type="number"
								name="discountPercent"
								value={discountPercent}
								onChange={this.onChange}
								placeholder="Enter discountPercent"
								required
							/>
						</FormGroup>
						<Row>
							<Col>
								<FormGroup>
									<Label style={{ display: "block" }}>Start Time</Label>
									<DatePicker
										maxDate={endTime}
										selected={startTime}
										onChange={(date) =>
											this.setState({ startTime: date })
										}
									/>
								</FormGroup>
							</Col>
							<Col>
								<FormGroup>
									<Label style={{ display: "block" }}>End Time</Label>
									<DatePicker
										minDate={startTime}
										selected={endTime}
										onChange={(date) =>
											this.setState({ endTime: date })
										}
									/>
								</FormGroup>
							</Col>
						</Row>
						<FormGroup>
							<Label>Min Order Amount (in paise)</Label>
							<Input
								type="number"
								name="minOrderAmount"
								value={minOrderAmount}
								onChange={this.onChange}
								placeholder="Enter minOrderAmount"
								required
							/>
						</FormGroup>
						<FormGroup>
							<Label>Max Discount (in paise)</Label>
							<Input
								type="number"
								name="maxDiscount"
								value={maxDiscount}
								onChange={this.onChange}
								placeholder="Enter maxDiscount"
								required
							/>
						</FormGroup>
						<FormGroup>
							<Label>Description</Label>
							<Input
								type="text"
								name="description"
								value={description}
								onChange={this.onChange}
								placeholder="Enter description"
								required
							/>
						</FormGroup>
						{error && <Alert color="danger">{error.message}</Alert>}
						<Button
							type="submit"
							color="primary"
							disabled={loading}
						>
							{loading ? (
								<i className="fa fa-refresh fa-spin" />
							) : (
								"Save"
							)}
						</Button>
					</Form>
				</CardBody>
			</Card>
		);
	}
}

export default withFirebase(CouponForm);
