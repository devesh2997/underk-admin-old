import React, { Component } from 'react'

import { withFirebase } from '../../firebase'

import OrdersOnDate from "./orders-by-date";

import {
	parseOrdersToArrangeByDate
} from '../../utils/index'

import DatePicker from 'react-datepicker'

import types from 'underk-types'


import './style.css'


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
	Collapse
} from 'reactstrap'

class OrdersList extends Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: false,
			orders: [],
			withStatus: 'all',
			withStartDate: new Date(2019, 11, 17),
			withEndDate: new Date(),
			withPaymentMode: 'all'
		}
	}

	componentDidMount () {
		this.setState({
			loading: true
		})
		let {
			withStatus,
			withStartDate,
			withEndDate,
			withPaymentMode
		} = this.state
		this.unsubscribe = this.props.firebase
			.ordersByStatusAndDateAndPaymentMode(
				withStatus,
				withStartDate,
				withEndDate,
				withPaymentMode
			)
			.onSnapshot(snapshot => {
				let orders = []
				snapshot.forEach(doc =>
					orders.push({ ...doc.data(), oid: doc.id })
				)

				orders = parseOrdersToArrangeByDate(orders)

				this.setState({
					orders,
					loading: false
				})
			})
	}

	componentWillUnmount () {
		this.unsubscribe()
	}

	onChange = event => {
		if (this.state[event.target.name] !== event.target.value) {
			if (event.target.name === 'withStatus') {
				this.setState({
					[event.target.name]: event.target.value,
					loading: true
				})
				let { withStartDate, withEndDate, withPaymentMode } = this.state
				this.unsubscribe = this.props.firebase
					.ordersByStatusAndDateAndPaymentMode(
						event.target.value,
						withStartDate,
						withEndDate,
						withPaymentMode
					)
					.onSnapshot(snapshot => {
						let orders = []
						snapshot.forEach(doc =>
							orders.push({ ...doc.data(), oid: doc.id })
						)

						orders = parseOrdersToArrangeByDate(orders)

						this.setState({
							orders,
							loading: false
						})
					})
			} else if (event.target.name === 'withPaymentMode') {
				this.setState({
					[event.target.name]: event.target.value,
					loading: true
				})
				let { withStartDate, withEndDate, withStatus } = this.state
				this.unsubscribe = this.props.firebase
					.ordersByStatusAndDateAndPaymentMode(
						withStatus,
						withStartDate,
						withEndDate,
						event.target.value
					)
					.onSnapshot(snapshot => {
						let orders = []
						snapshot.forEach(doc =>
							orders.push({ ...doc.data(), oid: doc.id })
						)

						orders = parseOrdersToArrangeByDate(orders)

						this.setState({
							orders,
							loading: false
						})
					})
			}
		}
	}

	handleStartDateChange = date => {
		this.setState({
			withStartDate: date,
			loading: true
		})
		let { withStatus, withEndDate, withPaymentMode } = this.state
		this.unsubscribe = this.props.firebase
			.ordersByStatusAndDateAndPaymentMode(
				withStatus,
				date,
				withEndDate,
				withPaymentMode
			)
			.onSnapshot(snapshot => {
				let orders = []
				snapshot.forEach(doc =>
					orders.push({ ...doc.data(), oid: doc.id })
				)

				orders = parseOrdersToArrangeByDate(orders)

				this.setState({
					orders,
					loading: false
				})
			})
	}

	handleEndDateChange = date => {
		this.setState({
			withEndDate: date,
			loading: true
		})
		let { withStatus, withStartDate, withPaymentMode } = this.state
		this.unsubscribe = this.props.firebase
			.ordersByStatusAndDateAndPaymentMode(
				withStatus,
				withStartDate,
				date,
				withPaymentMode
			)
			.onSnapshot(snapshot => {
				let orders = []
				snapshot.forEach(doc =>
					orders.push({ ...doc.data(), oid: doc.id })
				)

				orders = parseOrdersToArrangeByDate(orders)

				this.setState({
					orders,
					loading: false
				})
			})
	}

	onSubmit = event => {}

	render () {
		let {
			loading,
			orders,
			withStatus,
			withPaymentMode,
			withStartDate,
			withEndDate
		} = this.state

		return (
			<Card>
				<CardHeader>Orders</CardHeader>
				<CardBody>
					<Row>
						<Col>
							<InputGroup>
								<InputGroupAddon addonType='prepend'>
									<InputGroupText>Status</InputGroupText>
								</InputGroupAddon>
								<Input
									type='select'
									name='withStatus'
									value={withStatus}
									onChange={this.onChange}
								>
									<option>{types.ORDER_STATUS_PLACED}</option>
									<option>{types.ORDER_STATUS_ACTIVE}</option>
									<option>{types.ORDER_STATUS_CLOSED}</option>
									<option>
										{types.ORDER_STATUS_CREATED}
									</option>
									<option>all</option>
								</Input>
							</InputGroup>
						</Col>
						<Col>
							<InputGroup>
								<InputGroupAddon addonType='prepend'>
									<InputGroupText>Payment</InputGroupText>
								</InputGroupAddon>
								<Input
									type='select'
									name='withPaymentMode'
									value={withPaymentMode}
									onChange={this.onChange}
								>
									<option>all</option>
									<option>{types.PAYMENT_MODE_COD}</option>
									<option>
										{types.PAYMENT_MODE_RAZORPAY}
									</option>
								</Input>
							</InputGroup>
						</Col>
						<Col>
							<InputGroup>
								<InputGroupAddon addonType='prepend'>
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
								<InputGroupAddon addonType='prepend'>
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
					{loading && (
						<i className='fa fa-refresh fa-spin fa-3x fa-fw' />
					)}
					{!loading && (
						<ListGroup style={{ marginTop: '20px' }}>
							{orders.map((order, index) => {
								return (
									<OrdersOnDate
										key={index}
										orders={order.orders}
										date={order.date}
										firebase={this.props.firebase}
									/>
								)
							})}
						</ListGroup>
					)}
				</CardBody>
			</Card>
		)
	}
}



export default withFirebase(OrdersList)
