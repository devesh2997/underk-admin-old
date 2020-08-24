import React from 'react'
import { withFirebase } from '../../firebase'
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

import {
	timeStampToDateLocaleString,
	timeStampToLocaleString,
	timeStampToTimeLocaleString,
	addDays
} from '../../utils/index'

import './style.css'

import DatePicker from 'react-datepicker'

class TransactionsList extends React.Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: false,
			transactions: [],
			withStartDate: addDays(new Date(), -14),
			withEndDate: new Date()
		}
	}

	componentDidMount () {
		this.setState({ loading: true })
		let { withStartDate, withEndDate } = this.state
		this.unsubscribe = this.props.firebase
			.inventoryTransactions(withStartDate, withEndDate)
			.onSnapshot(snapshot => {
				let transactions = []
				if (!snapshot.empty) {
					snapshot = snapshot.docs
					snapshot.forEach(s => transactions.push(s.data()))
				}
				console.log('tt', transactions)
				this.setState({ loading: false, transactions })
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
			.inventoryTransactions(date, withEndDate)
			.onSnapshot(snapshot => {
				let transactions = []
				if (!snapshot.empty) {
					snapshot = snapshot.docs
					snapshot.forEach(s => transactions.push(s.data()))
				}
				this.setState({ loading: false, transactions })
			})
	}

	handleEndDateChange = date => {
		this.setState({
			withEndDate: date,
			loading: true
		})
		let { withStartDate } = this.state
		this.unsubscribe = this.props.firebase
			.inventoryTransactions(withStartDate, date)
			.onSnapshot(snapshot => {
				let transactions = []
				if (!snapshot.empty) {
					snapshot = snapshot.docs
					snapshot.forEach(s => transactions.push(s.data()))
				}
				this.setState({ loading: false, transactions })
			})
	}

	render () {
		const { loading, transactions, withStartDate, withEndDate } = this.state
		return (
			<Card>
				<CardHeader>Transactions</CardHeader>
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
						<ListGroup>
							{transactions.map((transaction, index) => {
								return (
									<ListGroupItem key={index}>
										<Row
											style={{
												fontWeight: 'bold'
											}}
										>
											<Col sm='3'>
												{index +
													1 +
													'.) ' +
													transaction.type}
											</Col>
											<Col>
												{timeStampToLocaleString(
													transaction.time
												)}
											</Col>
										</Row>
										<Row>
											<Col>
												{'sku : ' + transaction.sku}
											</Col>
											<Col>
												{'pid : ' + transaction.pid}
											</Col>
											<Col>
												{'reason : ' +
													transaction.reason}
											</Col>
										</Row>
									</ListGroupItem>
								)
							})}
						</ListGroup>
					)}
				</CardBody>
			</Card>
		)
	}
}

export default withFirebase(TransactionsList)
