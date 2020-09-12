import React, { Component } from 'react'
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Table,
	ListGroup,
	ListGroupItem,
	Row,
	Col
} from 'reactstrap'
import { withFirebase } from '../../firebase'
import {
	parseOrdersToArrangeByDate,
	timeStampToLocaleString
} from '../../utils'

import './style.css'

import OrdersOnDate from '../orders/orders-by-date'
import { sendProductsInCartSMS } from './utils'

class UserItemBase extends Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: false,
			user: null,
			orders: [],
			cart: [],
			wishlist: [],
			loadingCart: false,
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

		this.setState({ loadingCart: true })
		this.getCart = this.props.firebase
			.cart(this.props.match.params.id)
			.onSnapshot(async snapshot => {
				let cart
				if (snapshot.exists) {
					cart = snapshot.data()
					const cartProductSkus = Object.keys(cart.products)

					let products = []
					for (let i = 0; i < cartProductSkus.length; i++) {
						const sku = cartProductSkus[i]
						const product = await this.props.firebase
							.productWithSku(sku)
							.get()
						if (!product.empty) {
							const pid = product.docs[0].id
							product = product.docs[0].data()
							product['pid'] = pid
							product['cartSku'] = sku
							products.push(product)
						}
					}
					cart['products'] = products
				}

				this.setState({
					cart,
					loadingCart: false
				})
			})
	}

	componentWillUnmount () {
		this.unsubscribe && this.unsubscribe()
		this.getOrders && this.getOrders()
		this.getCart && this.getCart()
	}

	sendProductInCartSms = async () => {
		const flag = window.confirm('Send sms to ' + this.state.user.mobile)

		if (flag) {
			let res = await sendProductsInCartSMS(
				this.state.user.mobile,
				this.props.firebase
			)
			console.log(res)
		}
	}

	render () {
		const {
			user,
			loading,
			loadingOrders,
			orders,
			cart,
			loadingCart
		} = this.state

		return (
			<Card>
				<CardHeader>
					<Row>
						<Col>
							<h4>User ({this.props.match.params.id})</h4>
						</Col>
						{!loading && (
							<Col>
								<Button
									color='primary'
									onClick={this.sendProductInCartSms}
								>
									Send Products in cart SMS
								</Button>
							</Col>
						)}
					</Row>
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
					{loadingCart && (
						<i className='fa fa-refresh fa-spin fa-3x fa-fw' />
					)}
					{!loadingCart && cart && cart.products && (
						<Card>
							<CardHeader>Cart</CardHeader>
							<CardBody>
								<ListGroup style={{ marginTop: '20px' }}>
									{cart['products'].map((product, index) => {
										return (
											<ListGroupItem key={product.pid}>
												{product.title +
													' - ' +
													product.category.name +
													' - ' +
													product.cartSku}
											</ListGroupItem>
										)
									})}
								</ListGroup>
							</CardBody>
						</Card>
					)}
				</CardBody>
			</Card>
		)
	}
}

const UserItem = withFirebase(UserItemBase)
export default UserItem
