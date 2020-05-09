import React, { Component } from 'react'

// import { withFirebase } from '../../firebase'

import CustomOrdersOnDate from './custom-orders-by-date'

import { parseOrdersToArrangeByDate, addDays } from '../../utils/index'

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

class CustomOrders extends Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: true,
			orders: [],
			withStartDate: addDays(new Date(), -100),
			withEndDate: new Date()
		}
	}

	componentDidMount () {
		this.setState({
			loading: true
		})
		let { withStartDate, withEndDate } = this.state

		this.unsubscribe = this.props.firebase
			.customOrdersByDate(withStartDate, withEndDate)
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

	handleStartDateChange = date => {
		this.setState({
			withStartDate: date,
			loading: true
		})
		let { withEndDate } = this.state
		this.unsubscribe = this.props.firebase
			.customOrdersByDate(date, withEndDate)
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
		let { withStartDate } = this.state
		this.unsubscribe = this.props.firebase
			.customOrdersByDate(withStartDate, date)
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

	render () {
		let { loading, orders, withStartDate, withEndDate } = this.state

		return (
			<Card>
				<CardHeader>Custom Orders</CardHeader>
				<CardBody>
					<Row>
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
									<CustomOrdersOnDate
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

// export default withFirebase(CustomOrders)
