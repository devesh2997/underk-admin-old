import React, { Component } from 'react'

import { withFirebase } from '../../firebase'

import ReturnsOnDate from './returns-by-date'

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

class ReturnsList extends Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: true,
			returns: [],
			withStartDate: addDays(new Date(), -100),
			withEndDate: new Date()
		}
	}

	componentDidMount () {
		this.setState({ loading: true })

		let { withStartDate, withEndDate } = this.state

		this.unsubscribe = this.props.firebase
			.returnsByDate(withStartDate, withEndDate)
			.onSnapshot(snapshot => {
				let returns = []
				snapshot.forEach(doc =>
					returns.push({ ...doc.data(), oid: doc.id })
				)

				returns = parseOrdersToArrangeByDate(returns)

				this.setState({ returns, loading: false })
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
			.returnsByDate(date, withEndDate)
			.onSnapshot(snapshot => {
				let returns = []
				snapshot.forEach(doc =>
					returns.push({ ...doc.data(), oid: doc.id })
				)

				returns = parseOrdersToArrangeByDate(returns)

				this.setState({ returns, loading: false })
			})
	}

	handleEndDateChange = date => {
		this.setState({
			withEndDate: date,
			loading: true
		})
		let { withStartDate } = this.state
		this.unsubscribe = this.props.firebase
			.returnsByDate(withStartDate, date)
			.onSnapshot(snapshot => {
				let returns = []
				snapshot.forEach(doc =>
					returns.push({ ...doc.data(), oid: doc.id })
				)

				returns = parseOrdersToArrangeByDate(returns)

				this.setState({ returns, loading: false })
			})
	}

	render () {
		let { loading, returns, withStartDate, withEndDate } = this.state

		return (
			<Card>
				<CardHeader>Returns</CardHeader>
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
							{returns.map((returnOrder, index) => {
								return (
									<ReturnsOnDate
										key={index}
										orders={returnOrder.orders}
										date={returnOrder.date}
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

export default withFirebase(ReturnsList)
