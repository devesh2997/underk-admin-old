import React, { Component } from 'react'
// import { withFirebase } from '../../firebase'

import {
	getDateTimeStampFromDate,
	timeStampToTimeLocaleString,
	timeStampToDateLocaleString,
	isEmpty,
	addDays
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

class SmsList extends Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: false,
			sms: [],
			withStartDate: addDays(new Date(), -14),
			withEndDate: new Date()
		}
	}

	componentDidMount () {
		this.setState({ loading: true })

		let { withStartDate, withEndDate } = this.state

		this.unsubscribe = this.props.firebase
			.smsWithStartAndEndDate(withStartDate, withEndDate)
			.onSnapshot(snapshot => {
				let sms = []
				snapshot.forEach(doc => sms.push({ ...doc.data(), id: doc.id }))

				sms = this.parseSmsToArrangeByDate(sms)

				this.setState({
					sms,
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
			.SmsWithStartAndEndDate(date, withEndDate)
			.onSnapshot(snapshot => {
				let sms = []
				snapshot.forEach(doc => sms.push({ ...doc.data(), id: doc.id }))

				sms = this.parseSmsToArrangeByDate(sms)

				this.setState({
					sms,
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
			.SmsWithStartAndEndDate(withStartDate, date)
			.onSnapshot(snapshot => {
				let sms = []
				snapshot.forEach(doc => sms.push({ ...doc.data(), id: doc.id }))

				sms = this.parseSmsToArrangeByDate(sms)

				this.setState({
					sms,
					loading: false
				})
			})
	}

	parseSmsToArrangeByDate = sms => {
		let SmsByDate = {}
		for (let i = 0; i < sms.length; i++) {
			let s = sms[i]

			let smsDate = getDateTimeStampFromDate(
				new Date(parseInt(s.time))
			).toString()
			if (!SmsByDate[smsDate]) {
				SmsByDate[smsDate] = []
			}
			SmsByDate[smsDate].push(s)
		}
		let arrangedSms = []
		let smsDates = Object.keys(SmsByDate).sort()
		smsDates.reverse()
		for (let i = 0; i < smsDates.length; i++) {
			arrangedSms.push({
				date: smsDates[i],
				sms: SmsByDate[smsDates[i]]
			})
		}
		console.log(arrangedSms)
		return arrangedSms
	}

	render () {
		let { loading, sms, withStartDate, withEndDate } = this.state
		return (
			<Card>
				<CardHeader>Sms sent</CardHeader>
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
							{sms.map((s, index) => {
								return (
									<SmsOnDate
										key={index}
										sms={s.sms}
										date={s.date}
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

class SmsOnDate extends Component {
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
		let { sms, date } = this.props

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
							{sms.map((s, index) => {
								return (
									<ListGroupItem
										key={index}
										style={{
											borderLeft: '0px',
											borderBottom: '0px',
											borderRight: '0px'
										}}
									>
										<Row>
											<Col sm='2'>
												{timeStampToTimeLocaleString(
													s.time
												)}
											</Col>
											<Col>{s.number}</Col>
											<Col>{s.status}</Col>
										</Row>
										<Row>
											<Col>{s.message}</Col>
										</Row>{' '}
									</ListGroupItem>
								)
							})}
						</ListGroup>
					</CardBody>
				</Collapse>
			</Card>
		)
	}
}

// export default withFirebase(SmsList)
