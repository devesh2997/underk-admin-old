import React, { Component } from 'react'
import { withFirebase } from '../../firebase'

import {
	getDateTimeStampFromDate,
	timeStampToTimeLocaleString,
	timeStampToDateLocaleString,
	isEmpty
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

class EmailsList extends Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: false,
			emails: [],
			withStartDate: new Date(2019, 11, 17),
			withEndDate: new Date()
		}
	}

	componentDidMount () {
		this.setState({ loading: true })

		let { withStartDate, withEndDate } = this.state

		this.unsubscribe = this.props.firebase
			.emailsWithStartAndEndDate(withStartDate, withEndDate)
			.onSnapshot(snapshot => {
				let emails = []
				snapshot.forEach(doc =>
					emails.push({ ...doc.data(), id: doc.id })
				)

				emails = this.parseEmailsToArrangeByDate(emails)

				this.setState({
					emails,
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
			.emailsWithStartAndEndDate(date, withEndDate)
			.onSnapshot(snapshot => {
				let emails = []
				snapshot.forEach(doc =>
					emails.push({ ...doc.data(), id: doc.id })
				)

				emails = this.parseEmailsToArrangeByDate(emails)

				this.setState({
					emails,
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
			.emailsWithStartAndEndDate(withStartDate, date)
			.onSnapshot(snapshot => {
				let emails = []
				snapshot.forEach(doc =>
					emails.push({ ...doc.data(), id: doc.id })
				)

				emails = this.parseEmailsToArrangeByDate(emails)

				this.setState({
					emails,
					loading: false
				})
			})
	}

	parseEmailsToArrangeByDate = emails => {
		let emailsByDate = {}
		for (let i = 0; i < emails.length; i++) {
			let email = emails[i]

			let emailDate = getDateTimeStampFromDate(
				new Date(parseInt(email.time))
			).toString()
			if (!emailsByDate[emailDate]) {
				emailsByDate[emailDate] = []
			}
			emailsByDate[emailDate].push(email)
		}
		let arrangedEmails = []
		let emailDates = Object.keys(emailsByDate).sort()
		emailDates.reverse()
		for (let i = 0; i < emailDates.length; i++) {
			arrangedEmails.push({
				date: emailDates[i],
				emails: emailsByDate[emailDates[i]]
			})
		}
		console.log(arrangedEmails)
		return arrangedEmails
	}

	render () {
		let { loading, emails, withStartDate, withEndDate } = this.state
		return (
			<Card>
				<CardHeader>Emails sent</CardHeader>
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
							{emails.map((email, index) => {
								return (
									<EmailsOnDate
										key={index}
										emails={email.emails}
										date={email.date}
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

class EmailsOnDate extends Component {
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
		let { emails, date } = this.props

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
							{emails.map((email, index) => {
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
											<Col>
												{timeStampToTimeLocaleString(
													email.time
												)}
											</Col>
											{!isEmpty(email.template) && (
												<Col>{email.template.name}</Col>
											)}
										</Row>
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

export default withFirebase(EmailsList)
