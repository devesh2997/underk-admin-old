import React, { Component } from 'react'
import * as utils from '../../utils'

import { StatusBadge } from '../../widgets'

import { initDelivery, cancelProduct } from '../../services/order.service'
import { to } from '../../services/util.service'

import ROUTES from '../../routes'
import { Link } from 'react-router-dom'

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
import {
	paiseToRupeeString,
	timeStampToLocaleString,
	getDateTimeStampFromDate,
	timeStampToDateLocaleString,
	timeStampToTimeLocaleString,
	beautifyAddress,
	parseOrdersToArrangeByDate
} from '../../utils/index'

import types from 'underk-types'

class ReturnOrderItem extends Component {
	constructor (props) {
		super(props)

		this.state = {
			loadingOrder: false,
			errors: [],
			processing: false
		}
	}

	componentDidMount () {
		this.setState({ loadingOrder: true })

		let returnRequest = this.props.returnRequest
		this.unsubscribe = this.props.firebase
			.order(returnRequest.oid)
			.onSnapshot(snapshot => {
				if (snapshot.exists) {
					snapshot = snapshot.data()
				}

				this.setState({ order: snapshot, loadingOrder: false })
			})
	}

	// componentWillUnmount(){
	// 	this.unsubscribe
	// }

	manifestReturn = async (sku, returnTrackingId) => {
		this.setState({ processing: true })
		let returnRequest = this.props.returnRequest
		let order = this.state.order
		order.products[sku]['delivery']['status'] =
			types.DELIVERY_STATUS_RETURN_MANIFESTED
		order.products[sku]['delivery']['returnTrackingId'] = returnTrackingId
		await this.props.firebase
			.order(returnRequest.oid)
			.set(order, { merge: true })
		await this.sendMessage(
			order.address.mobile,
			`Your return request for ${order.products[sku].product.name} has been accepted. The product(s) will be picked up in 4-5 days. Refund towards your return shall be processed soon.`
		)
		this.setState({ processing: false })
	}

	sendMessage = async (number, message) => {
		const smsRef = this.props.firebase.sms()
		let errors = []
		this.setState({ processing: true, errors })

		try {
			await smsRef.add({
				number,
				message,
				status: types.ACTION_STATUS_INIT,
				time: new Date().getTime()
			})
		} catch (e) {
			console.log(e)
			errors.push(e)
		}

		this.setState({ errors, processing: false })
	}

	render () {
		let { index, returnRequest } = this.props
		const { order, loadingOrder } = this.state
		const returnedProductSkus = Object.keys(returnRequest.skus)

		return (
			<ListGroupItem
				style={{
					borderLeft: '0px',
					borderBottom: '0px',
					borderRight: '0px'
				}}
			>
				<div>
					<Row
						style={{
							fontWeight: 'bold'
						}}
					>
						<Col sm='3'>
							<Row>{index + 1 + ') ' + returnRequest.oid}</Row>
						</Col>
						<Col sm='9'>
							<Row>
								<Col>
									{timeStampToTimeLocaleString(
										returnRequest.lastRequestCreatedOn
									)}
								</Col>
							</Row>
						</Col>
					</Row>
					{loadingOrder && 'Loading'}
					{!loadingOrder &&
						order &&
						returnedProductSkus.map(sku => {
							const returnItem = returnRequest.skus[sku]
							const orderItem = order.products[sku]
							return (
								<Row
									key={index + sku}
									style={{
										marginLeft: '15px',
										marginTop: '5px'
									}}
								>
									<Col sm='2'>
										<img
											style={{
												maxWidth: '100px',
												maxHeight: '100px'
											}}
											src={orderItem.product.asset.url}
										/>
									</Col>
									<Col>
										<Row>{sku}</Row>
										<Row>
											{'Pickup Address : ' +
												beautifyAddress(
													returnItem.pickupAddress
												)}
										</Row>
										<Row>
											{returnItem.accountDetails &&
												'Account Details : ' +
													JSON.stringify(
														returnItem.accountDetails
													)}
										</Row>
										<Row>
											<Col>
												<Label
													style={{
														marginRight: '20px'
													}}
												>
													Product Status :
												</Label>

												<StatusBadge
													status={orderItem.status}
												/>
											</Col>
											<Col>
												<Label
													style={{
														marginRight: '20px'
													}}
												>
													Delivery Status :
												</Label>

												<StatusBadge
													status={
														orderItem.delivery
															.status
													}
												/>
											</Col>
										</Row>
										{/* {orderItem.delivery.status === types.DELIRET} */}
									</Col>
								</Row>
							)
						})}
				</div>
			</ListGroupItem>
		)
	}
}

export default ReturnOrderItem
