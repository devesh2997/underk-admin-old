import React, { Component } from 'react'
import { Card, CardBody, CardHeader, Table } from 'reactstrap'
import { withFirebase } from '../../firebase'
import { Link } from 'react-router-dom'
import ROUTES from '../../routes'
import { isEmpty,timeStampToLocaleString } from '../../utils'

class UserListBase extends Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: false,
			users: []
		}
	}

	componentDidMount () {
		this.setState({ loading: true })

		this.unsubscribe = this.props.firebase
			.users()
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

	render () {
		const { users, loading } = this.state

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
					<Table striped responsive>
						<thead>
							<tr>
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
										<td>{timeStampToLocaleString(user.created_at)}</td>
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
				</CardBody>
			</Card>
		)
	}
}

const UserList = withFirebase(UserListBase)
export default UserList
