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

import axios from 'axios'

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

	componentWillUnmount(){
		this.unsubscribe && this.unsubscribe();
	}

	manifestReturn = async (sku) => {
		this.setState({ processing: true })
		let returnTrackingId = window.prompt('Please enter returnTrackingId.')
		if (!returnTrackingId) {
			this.setState({ processing: false })
			return
		}
		const { returnRequest } = this.props
		try {
			let response = await axios({
				method: 'POST',
				url: 'https://us-central1-underk-firebase.cloudfunctions.net/adminApp/manifestReturn',
				data: {
					orderId: returnRequest.oid,
					productSKU: sku,
					returnTrackingId
				}
			})
			console.log(response.data);
		} catch(error) {
			console.log(error);
		}
		this.setState({ processing: false })
	}

	initiateRefund = async (sku) => {
		this.setState({ processing: true })
		const { returnRequest } = this.props
		try {
			let response = await axios({
				method: 'POST',
				url: 'https://us-central1-underk-firebase.cloudfunctions.net/adminApp/initiateRefund',
				data: {
					orderId: returnRequest.oid,
					productSKU: sku
				}
			})
			console.log(response.data);
		} catch(error) {
			console.log(error);
		}
		this.setState({ processing: false })
	}

	render () {
		let { index, returnRequest } = this.props
		const { order, loadingOrder, processing } = this.state
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
									</Col>
									<Col sm="2">
										{orderItem.delivery.status === types.DELIVERY_STATUS_RETURN_REQUESTED &&
											<Button type="button"
												outline
												color="primary"
												onClick={() => {
													let isConfirmed = window.confirm('Are you sure?');
													if(isConfirmed) {
														this.manifestReturn(sku);
													}
												}}
												disabled={processing}
											>
												{processing && <i className="fa fa-refresh fa-spin" />} Manifest Return
											</Button>
										}
										{orderItem.delivery.status === types.DELIVERY_STATUS_RETURN_MANIFESTED &&
											<div>
												<div>
													returnTrackingId: {returnItem.returnTrackingId}
												</div>
												<div>
													<Button type="button"
														outline
														color="primary"
														onClick={() => {
															let isConfirmed = window.confirm('Are you sure');
															if(isConfirmed) {
																this.initiateRefund(sku);
															}
														}}
														disabled={processing}
													>
														{processing && <i className="fa fa-refresh fa-spin" />} Initiate Refund
													</Button>
												</div>
											</div>
										}
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
