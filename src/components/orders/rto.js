import React, { Component } from 'react'

import { withFirebase } from '../../firebase'

import OrdersOnDate from './orders-by-date'

import { parseOrdersToArrangeByDate, addDays } from '../../utils/index'

import DatePicker from 'react-datepicker'

import types from 'underk-types'

import { CSVLink } from 'react-csv'

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

class RTOOrdersList extends Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: false,
			orders: [],
			withStatus: 'all',
			withStartDate: addDays(new Date(), -14),
			withEndDate: new Date(),
			withPaymentMode: 'all',
			generatingCsvData: false,
			csvData: []
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
				this.filterAndParseOrdersFromSnapshot(snapshot)
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
						this.filterAndParseOrdersFromSnapshot(snapshot)
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
						this.filterAndParseOrdersFromSnapshot(snapshot)
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
				this.filterAndParseOrdersFromSnapshot(snapshot)
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
				this.filterAndParseOrdersFromSnapshot(snapshot)
			})
	}

	filterAndParseOrdersFromSnapshot = async snapshot => {
		let orders = []
		snapshot.forEach(doc => orders.push({ ...doc.data(), oid: doc.id }))

		orders = orders.filter(order => {
			const orderProductSkus = Object.keys(order.products)
			let hasRTO = false
			for (let i = 0; i < orderProductSkus.length; i++) {
				const orderProduct = order.products[orderProductSkus[i]]
				console.log(orderProduct.delivery.status)
				if (
					orderProduct.delivery.status ===
						types.DELIVERY_STATUS_CANCELLED_RETURNED ||
					orderProduct.delivery.status ===
						types.DELIVERY_STATUS_CANCELLED_RETURN_IN_TRANSIT ||
					orderProduct.delivery.status === 'cancelledreturnintransit'
				) {
					hasRTO = true
				}
			}

			console.log(hasRTO)

			return hasRTO
		})

		orders = parseOrdersToArrangeByDate(orders)

		this.setState({
			orders,
			loading: false
		})
	}

	onSubmit = event => {}

	generateContactInfo = async () => {
		if (this.state.csvData.length > 0) {
			return
		}
		this.setState({ generatingCsvData: true })
		try {
			let snapshot = await this.props.firebase.orders().get()
			let orders = []
			snapshot.docs.forEach(doc => {
				orders.push({ ...doc.data(), id: doc.id })
			})
			snapshot = await this.props.firebase.users().get()
			let users = {}
			snapshot.docs.forEach(doc => {
				users[doc.id] = doc.data()
			})
			const csvData = orders.map(order => {
				return {
					oid: order.id,
					status: order.status,
					uid: order.uid,
					name: users[order.uid].name,
					mobile: users[order.uid].mobile,
					email: users[order.uid].email
				}
			})
			this.setState({ csvData })
		} catch (error) {
			console.error('generateContactInfo', error)
		}
		this.setState({ generatingCsvData: false })
	}

	render () {
		let {
			loading,
			orders,
			withStatus,
			withPaymentMode,
			withStartDate,
			withEndDate,
			generatingCsvData,
			csvData
		} = this.state

		return (
			<Card>
				<CardHeader>
					<Row className='align-items-center'>
						<Col>Orders that containe RTO products</Col>
						<Col className='text-right'>
							<Button
								type='button'
								color='primary'
								onClick={this.generateContactInfo}
								disabled={generatingCsvData}
							>
								{generatingCsvData ? (
									<span>
										<i className='fa fa-refresh fa-spin fa-fw' />{' '}
										Generating
									</span>
								) : (
									<span>Generate Contact Info</span>
								)}
							</Button>
							{csvData.length > 0 ? (
								<CSVLink
									data={csvData}
									headers={[
										{ label: 'Order Id', key: 'oid' },
										{
											label: 'Order Status',
											key: 'status'
										},
										{ label: 'User Id', key: 'uid' },
										{ label: 'Name', key: 'name' },
										{ label: 'Mobile', key: 'mobile' },
										{ label: 'Email', key: 'email' }
									]}
									filename='order_contact_info.csv'
									style={{
										marginLeft: 5
									}}
								>
									<i className='fa fa-download' />
								</CSVLink>
							) : null}
						</Col>
					</Row>
				</CardHeader>
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

export default withFirebase(RTOOrdersList)
