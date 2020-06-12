import React, { Component } from 'react'
import { withFirebase } from '../../firebase'
import './style.css'

import {
	getDateTimeStampFromDate,
	timeStampToTimeLocaleString,
	timeStampToDateLocaleString,
	isEmpty,
	timeStampToLocaleString
} from '../../utils/index'
import DatePicker from 'react-datepicker'

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

class PurchaseSaleSheet extends Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: false,
			sheets: [],
			withStartDate: new Date(2019, 11, 17),
			withEndDate: new Date()
		}
	}

	componentDidMount () {
		this.setState({ loading: true })

		this.unsubscribe = this.props.firebase.db
			.collection('accounting')
			.doc('purchase-sale-sheets')
			.collection('purchase-sale-sheets')
			.orderBy('time', 'desc')
			.onSnapshot(snapshot => {
				let sheets = []
				snapshot.forEach(doc =>
					sheets.push({ ...doc.data(), id: doc.id })
				)
				console.log(sheets)
				this.setState({ sheets, loading: false })
			})
	}

	handleStartDateChange = date => {
		this.setState({
			withStartDate: date
		})
	}

	handleEndDateChange = date => {
		this.setState({
			withEndDate: date
		})
	}

	generate = () => {
		const { withStartDate, withEndDate } = this.state
		this.props.firebase.db
			.collection('accounting')
			.doc('purchase-sale-sheets')
			.collection('purchase-sale-sheets')
			.add({
				status: 'init',
				startTime: withStartDate.getTime(),
				endTime: withEndDate.getTime(),
				time: new Date().getTime()
			})
	}

	render () {
		let { loading, withStartDate, withEndDate, sheets } = this.state
		console.log(withStartDate, withEndDate)
		return (
			<Card>
				<CardHeader>Purchase Sale Sheets</CardHeader>
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
						<Col>
							<Button color='primary' onClick={this.generate}>
								Generate
							</Button>
						</Col>
					</Row>
					{loading && (
						<i className='fa fa-refresh fa-spin fa-3x fa-fw' />
					)}
					{!loading && (
						<ListGroup style={{ marginTop: '20px' }}>
							{sheets.map((sheet, index) => {
								return (
									<ListGroupItem key={index}>
										<Row>
											<Col sm='2'>{index + 1 + ') '}</Col>
											<Col>
												Time :{' '}
												{timeStampToLocaleString(
													sheet.time
												)}
											</Col>
											<Col>
												From :{' '}
												{timeStampToDateLocaleString(
													sheet.startTime
												)}
											</Col>
											<Col>
												To :{' '}
												{timeStampToDateLocaleString(
													sheet.endTime
												)}
											</Col>
											{sheet.status === 'completed' && (
												<Col>
													<a
														href={sheet.downloadURL}
														target='_blank'
													>
														<Button color='primary'>
															Download CSV
														</Button>
													</a>
												</Col>
											)}
											{sheet.status !== 'completed' && (
												<Col>{sheet.status}</Col>
											)}
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

export default withFirebase(PurchaseSaleSheet)
