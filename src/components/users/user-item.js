import React, { Component } from 'react'
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Table,
	ListGroup
} from 'reactstrap'
// import { withFirebase } from '../../firebase'
import {
	parseOrdersToArrangeByDate,
	timeStampToLocaleString
} from '../../utils'

import OrdersOnDate from '../orders/orders-by-date'

class UserItemBase extends Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: false,
			user: null,
			orders: [],
			loadingOrders: false,
			...props.location.state
		}
	}

	componentDidMount () {
		this.setState({ loading: true })
		this.unsubscribe = this.props.firebase
			.user(this.props.match.params.id)
			.onSnapshot(snapshot => {
				this.setState({
					user: snapshot.data(),
					loading: false
				})
			})

		this.setState({ loadingOrders: true })

		this.getOrders = this.props.firebase
			.ordersByUser(this.props.match.params.id)
			.onSnapshot(snapshot => {
				let orders = []
				snapshot.forEach(doc =>
					orders.push({ ...doc.data(), oid: doc.id })
				)

				orders = parseOrdersToArrangeByDate(orders)

				this.setState({
					orders,
					loadingOrders: false
				})
			})
	}

	componentWillUnmount () {
		this.unsubscribe && this.unsubscribe()
		this.getOrders && this.getOrders()
	}

	render () {
		const { user, loading, loadingOrders, orders } = this.state

		return (
			<Card>
				<CardHeader>
					<h4>User ({this.props.match.params.id})</h4>
				</CardHeader>
				<CardBody>
					{loading && (
						<div className='animated fadeIn pt-3 text-center'>
							Loading...
						</div>
					)}
					{user && (
						<Table striped responsive>
							<tbody>
								<tr>
									<th scope='row'>ID</th>
									<td>{this.props.match.params.id}</td>
								</tr>
								<tr>
									<th scope='row'>Name</th>
									<td>{user.name}</td>
								</tr>
								<tr>
									<th scope='row'>Email</th>
									<td>{user.email}</td>
								</tr>
								<tr>
									<th scope='row'>Mobile</th>
									<td>{user.mobile}</td>
								</tr>
								<tr>
									<th scope='row'>Created At</th>
									<td>
										{timeStampToLocaleString(
											user.created_at
										)}
									</td>
								</tr>
							</tbody>
						</Table>
					)}
					{loadingOrders && (
						<i className='fa fa-refresh fa-spin fa-3x fa-fw' />
					)}
					{!loadingOrders && (
						<ListGroup style={{ marginTop: '20px' }}>
							{orders.map((order, index) => {
								return (
									<OrdersOnDate
										key={index}
										orders={order.orders}
										date={order.date}
										firebase={this.props.firebase}
										showUid={false}
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

// const UserItem = withFirebase(UserItemBase)
// export default UserItem
