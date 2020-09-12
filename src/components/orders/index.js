import React, { Component } from 'react'

import { withFirebase } from '../../firebase'

import { addDays } from '../../utils/index'

import DatePicker from 'react-datepicker'

import Shipments from './shipments'

import { CSVLink } from 'react-csv'

import './style.css'

import Orders from './orders'
import classnames from 'classnames'

import {
	Card,
	CardHeader,
	CardBody,
	Button,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	Col,
	Row,
	Nav,
	TabPane,
	NavItem,
	NavLink,
	TabContent
} from 'reactstrap'

class OrdersList extends Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: false,
			orders: [],
			createdOrders: [],
			activeOrders: [],
			placedOrders: [],
			closedOrders: [],
			dormantOrders: [],
			withStatus: 'all',
			withStartDate: addDays(new Date(), -14),
			withEndDate: new Date(),
			withPaymentMode: 'all',
			generatingCsvData: false,
			csvData: [],
			activeTab: 'orders'
		}
	}

	setActiveTab = tab => {
		this.setState({ activeTab: tab })
	}

	fetchOrders = () => {
		this.setState({
			loading: true
		})
		const {
			withStartDate,
			withEndDate,
			withStatus,
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

				this.setState({
					orders,
					loading: false
				})
			})
	}

	componentDidMount () {
		this.fetchOrders()
	}

	componentWillUnmount () {
		this.unsubscribe()
	}

	onChange = event => {
		if (this.state[event.target.name] !== event.target.value) {
			this.setState(
				{
					[event.target.name]: event.target.value
				},
				() => this.fetchOrders()
			)
		}
	}

	handleStartDateChange = date => {
		this.setState(
			{
				withStartDate: date
			},
			() => this.fetchOrders()
		)
	}

	handleEndDateChange = date => {
		this.setState(
			{
				withEndDate: date
			},
			() => this.fetchOrders()
		)
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
			csvData,
			activeTab
		} = this.state

		return (
			<Card>
				<CardHeader>
					<Row className='align-items-center'>
						{/* <Col>
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
						</Col> */}
						{/* <Col>
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
						</Col> */}
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
				<CardBody style={{ padding: '0px' }}>
					{loading && (
						<i className='fa fa-refresh fa-spin fa-3x fa-fw' />
					)}
					{!loading && (
						<div>
							<Row style={{ margin: '20px' }}>
								<Col
									style={{ cursor: 'pointer' }}
									onClick={() => this.setActiveTab('orders')}
								>
									Orders
								</Col>
								<Col
									style={{ cursor: 'pointer' }}
									onClick={() =>
										this.setActiveTab('shipments')
									}
								>
									Shipments
								</Col>
							</Row>
							<Row>
								<Col>
									{activeTab === 'orders' ? (
										<Orders
											orders={orders}
											firebase={this.props.firebase}
										/>
									) : (
										<Shipments orders={orders} />
									)}
								</Col>
							</Row>
						</div>
					)}
				</CardBody>
			</Card>
		)
	}
}

export default withFirebase(OrdersList)
