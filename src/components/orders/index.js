import React, { Component } from 'react'

import { withFirebase } from '../../firebase'

import {
	paiseToRupeeString,
	timeStampToLocaleString,
	getDateTimeStampFromDate,
	timeStampToDateLocaleString,
	timeStampToTimeLocaleString
} from '../../utils/index'

import DatePicker from 'react-datepicker'

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
	ListGroupItemHeading,
	ListGroupItemText,
	Collapse
} from 'reactstrap'

class OrdersList extends Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: false,
			orders: [],
			withStatus: 'placed',
			withStartDate: new Date(),
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

				orders = this.parseOrdersToArrangeByDate(orders)

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

						orders = this.parseOrdersToArrangeByDate(orders)

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

						orders = this.parseOrdersToArrangeByDate(orders)

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

				orders = this.parseOrdersToArrangeByDate(orders)

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

				orders = this.parseOrdersToArrangeByDate(orders)

				this.setState({
					orders,
					loading: false
				})
			})
	}

	onSubmit = event => {}

	parseOrdersToArrangeByDate = orders => {
		let ordersByDate = {}
		let ordersTotalRevenue = 0
		let ordersTotalProductCount = 0
		let ordersTotalCodOrders = 0
		let ordersTotalOnlineOrders = 0
		for (let i = 0; i < orders.length; i++) {
			let order = orders[i]
			ordersTotalRevenue += order.summary.total
			ordersTotalProductCount += order.product_count
			if (order.payment.mode === 'cod') {
				ordersTotalCodOrders++
			} else {
				ordersTotalOnlineOrders++
			}
			let orderDate = getDateTimeStampFromDate(
				new Date(parseInt(order.time))
			).toString()
			if (!ordersByDate[orderDate]) {
				ordersByDate[orderDate] = []
			}
			ordersByDate[orderDate].push(order)
		}
		let arrangedOrders = []
		let orderDates = Object.keys(ordersByDate).sort()
		orderDates.reverse()
		for (let i = 0; i < orderDates.length; i++) {
			arrangedOrders.push({
				date: orderDates[i],
				orders: ordersByDate[orderDates[i]]
			})
		}
		this.setState({
			ordersTotalCodOrders,
			ordersTotalRevenue,
			ordersTotalOnlineOrders,
			ordersTotalProductCount
		})
		return arrangedOrders
	}

	render () {
		let {
			loading,
			orders,
			withStatus,
			withPaymentMode,
			withStartDate,
			withEndDate,
			ordersTotalCodOrders,
			ordersTotalRevenue,
			ordersTotalOnlineOrders,
			ordersTotalProductCount
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
									<option>placed</option>
									<option>created</option>
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
									<option>cod</option>
									<option>rzp</option>
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
						<Card style={{ marginTop: '20px' }}>
							<CardHeader>Summary</CardHeader>
							<CardBody>
								<Row>
									<Col>
										<Row>
											<Col>Total Revenue: </Col>
											<Col>
												{paiseToRupeeString(
													ordersTotalRevenue
												)}
											</Col>
										</Row>
									</Col>
									<Col>
										<Row>
											<Col>
												Total Products (quantity not
												included):{' '}
											</Col>
											<Col>{ordersTotalProductCount}</Col>
										</Row>
									</Col>
								</Row>
								<Row>
									<Col>
										<Row>
											<Col>Total COD Orders: </Col>
											<Col>{ordersTotalCodOrders}</Col>
										</Row>
									</Col>
									<Col>
										<Row>
											<Col>Total Online Orders: </Col>
											<Col>{ordersTotalOnlineOrders}</Col>
										</Row>
									</Col>
								</Row>
							</CardBody>
						</Card>
					)}
					{!loading && (
						<ListGroup style={{ marginTop: '20px' }}>
							{orders.map((order, index) => {
								return (
									<OrdersOnDate
										key={index}
										orders={order.orders}
										date={order.date}
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

class OrdersOnDate extends Component {
	constructor (props) {
		super(props)
		this.state = {
			collapsed: false
		}
	}

	toggle = () => {
		this.setState({ collapsed: !this.state.collapsed })
	}

	render () {
		let { orders, date } = this.props
		return (
			<Card>
				<CardHeader onClick={this.toggle} style={{ cursor: 'pointer' }}>
					<span style={{ marginRight: '10px' }}>
						{this.state.collapsed ? (
							<i
								className='fa fa-chevron-down'
								aria-hidden='true'
							></i>
						) : (
							<i
								className='fa fa-chevron-up'
								aria-hidden='true'
							></i>
						)}
					</span>
					{timeStampToDateLocaleString(
						new Date(parseInt(date)).getTime()
					)}
				</CardHeader>
				<Collapse isOpen={!this.state.collapsed}>
					<CardBody style={{ margin: '0px', padding: '0px' }}>
						<ListGroup>
							{orders.map((order, index) => {
								return (
									<OrderItem
										key={index}
										order={order}
										index={index}
									/>
								)
							})}
						</ListGroup>
					</CardBody>
				</Collapse>
			</Card>
		)
	}
}

class OrderItem extends Component {
	constructor (props) {
		super(props)
		this.state = {
			collapsed: true
		}
	}

	toggle = () => {
		this.setState({ collapsed: !this.state.collapsed })
	}

	render () {
		let { order, index } = this.props
		return (
			<ListGroupItem
				style={{
					borderLeft: '0px',
					borderBottom: '0px',
					borderRight: '0px'
				}}
			>
				<ListGroupItemHeading
					onClick={this.toggle}
					style={{ cursor: 'pointer' }}
				>
					<Row>
						<Col>{index + 1 + ') ' + order.oid}</Col>
						<Col>
							{order.product_count +
								(order.product_count > 1
									? ' items '
									: ' item ')}
						</Col>
						<Col>{paiseToRupeeString(order.summary.total)}</Col>
						<Col>{timeStampToTimeLocaleString(order.time)}</Col>
						<Col>
							<Row>
								<Col>
									{order.payment.mode === 'cod' ? (
										<i
											className='fa fa-money'
											aria-hidden='true'
											style={{ color: '#00ff00' }}
										></i>
									) : (
										<i
											className='fa fa-credit-card-alt'
											aria-hidden='true'
											style={{ color: '#20a8d8' }}
										></i>
									)}
								</Col>
							</Row>
						</Col>
					</Row>
				</ListGroupItemHeading>
				<Collapse isOpen={!this.state.collapsed}>
					<ListGroupItemText>{order.time}</ListGroupItemText>
				</Collapse>
			</ListGroupItem>
		)
	}
}

export default withFirebase(OrdersList)
