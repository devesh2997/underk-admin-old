import React, { Component } from 'react'
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
	Collapse,
	Table
} from 'reactstrap'
import DatePicker from 'react-datepicker'
import { withFirebase } from '../../firebase'
import { Link } from 'react-router-dom'
import ROUTES from '../../routes'
import { addDays, timeStampToLocaleString } from '../../utils'

class UserListBase extends Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: false,
			users: [],
			selectedUsers: [],
			sendingEmail: false,
			withStartDate: addDays(new Date(), -3),
			withEndDate: new Date(),
			emailSubject: '',
			emailBody: '',
			emailFrom: 'no-reply@underk.in'
		}
	}

	componentDidMount () {
		this.setState({ loading: true })

		const { withStartDate, withEndDate } = this.state

		this.unsubscribe = this.props.firebase
			.usersWithStartAndEndDate(withStartDate, withEndDate)
			.onSnapshot(async snapshot => {
				let users = []

				snapshot.forEach(doc =>
					users.push({ ...doc.data(), uid: doc.id })
				)

				this.setState({
					users,
					loading: false
				})
			})
	}

	handleStartDateChange = date => {
		this.setState({
			withStartDate: date,
			loading: true
		})
		let { withStartDate, withEndDate } = this.state
		this.unsubscribe = this.props.firebase
			.usersWithStartAndEndDate(withStartDate, withEndDate)
			.onSnapshot(async snapshot => {
				let users = []

				snapshot.forEach(doc =>
					users.push({ ...doc.data(), uid: doc.id })
				)

				this.setState({
					users,
					loading: false
				})
			})
	}

	handleEndDateChange = date => {
		this.setState({
			withEndDate: date,
			loading: true
		})
		let { withEndDate, withStartDate } = this.state
		this.unsubscribe = this.props.firebase
			.usersWithStartAndEndDate(withStartDate, withEndDate)
			.onSnapshot(async snapshot => {
				let users = []

				snapshot.forEach(doc =>
					users.push({ ...doc.data(), uid: doc.id })
				)

				this.setState({
					users,
					loading: false
				})
			})
	}

	componentWillUnmount () {
		this.unsubscribe()
	}

	onChange = event => {
		this.setState({ [event.target.name]: event.target.value })
	}

	onChecked = event => {
		let selectedUsers = this.state.selectedUsers
		let isPresentAt = -1
		for (let i = 0; i < selectedUsers.length; i++) {
			if (selectedUsers[i] === event.target.name) {
				isPresentAt = i
				break
			}
		}
		if (isPresentAt > -1) {
			selectedUsers.splice(isPresentAt, 1)
		} else {
			selectedUsers.push(event.target.name)
		}
		this.setState({ selectedUsers })
	}

	isChecked = uid => {
		let selectedUsers = this.state.selectedUsers
		let isPresent = selectedUsers.find(s => s === uid)
		return isPresent ? true : false
	}

	selectAll = () => {
		if (this.state.selectedUsers.length === this.state.users.length) {
			return this.setState({ selectedUsers: [], sendingEmail: false })
		}
		let all = this.state.users.map(user => user.uid)
		this.setState({ selectedUsers: all })
	}

	toggleSendingEmail = () => {
		this.setState({ sendingEmail: !this.state.sendingEmail })
	}

	sendEmail = () => {
		const { emailFrom, emailSubject, emailBody, selectedUsers } = this.state
		const flag = window.confirm(
			'Send email to ' + selectedUsers.length + ' user/s ?'
		)
		if (flag) {
			this.setState({ loading: true })
			this.props.firebase.db
				.collection('mail')
				.add({
					from: emailFrom,
					message: { subject: emailSubject, text: emailBody },
					bccUids: selectedUsers
				})
				.then(() => {
					this.setState({ loading: false, sendingEmail: false })
				})
		}
	}

	render () {
		const {
			users,
			loading,
			selectedUsers,
			sendingEmail,
			emailSubject,
			emailBody,
			emailFrom,
			withStartDate,
			withEndDate
		} = this.state

		return (
			<Card>
				<CardHeader>
					<h4>Users</h4>
				</CardHeader>
				<CardBody>
					{loading && (
						<div className='animated fadeIn pt-3 text-center'>
							Loading...
						</div>
					)}
					{selectedUsers.length > 0 && (
						<Row style={{ marginBottom: '20' }}>
							<Col>
								<Button
									onClick={this.toggleSendingEmail}
									color={!sendingEmail ? 'primary' : 'danger'}
								>
									{sendingEmail ? 'Cancel' : 'Send Email'}
								</Button>
							</Col>
						</Row>
					)}
					{selectedUsers.length > 0 && sendingEmail && (
						<Container>
							<Row>
								<Col sm='2'>From : </Col>
								<Col>
									<Input
										name='emailFrom'
										onChange={this.onChange}
										value={emailFrom}
										type='text'
									/>
								</Col>
							</Row>
							<Row>
								<Col sm='2'>Suject : </Col>
								<Col>
									<Input
										name='emailSubject'
										onChange={this.onChange}
										value={emailSubject}
										type='text'
									/>
								</Col>
							</Row>
							<Row>
								<Col sm='2'>Body : </Col>
								<Col>
									<Input
										name='emailBody'
										onChange={this.onChange}
										value={emailBody}
										type='textarea'
									/>
								</Col>
							</Row>
							<Row>
								<Col>
									<Button
										onClick={this.sendEmail}
										color='primary'
									>
										Send
									</Button>
								</Col>
							</Row>
						</Container>
					)}
					{!loading && (
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
					)}
					<Row>
						<Table striped responsive>
							<thead>
								<tr>
									<th
										onClick={this.selectAll}
										style={{
											color: 'blue',
											cursor: 'pointer'
										}}
									>
										All
									</th>
									<th>#</th>
									<th>ID</th>
									<th>Name</th>
									<th>Email</th>
									<th>Mobile</th>
									<th>Created At</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{users.map((user, idx) => (
									<tr key={user.uid}>
										<td>
											<Input
												type='checkbox'
												name={user.uid}
												checked={this.isChecked(
													user.uid
												)}
												onChange={this.onChecked}
											/>
										</td>
										<td>{idx + 1}</td>
										<td>{user.uid}</td>
										<td>{user.name}</td>
										<td>
											{user.email}
											{user.isEmailVerified && (
												<i className='fa fa-check'></i>
											)}
										</td>
										<td>
											{user.mobile}
											{user.isMobileVerified && (
												<i className='fa fa-check'></i>
											)}
										</td>
										<td>
											{timeStampToLocaleString(
												user.created_at
											)}
										</td>
										<td>
											<Link
												to={{
													pathname: `${ROUTES.USER_LIST.path}/${user.uid}`,
													state: { user }
												}}
											>
												Details
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					</Row>
				</CardBody>
			</Card>
		)
	}
}

const UserList = withFirebase(UserListBase)
export default UserList
