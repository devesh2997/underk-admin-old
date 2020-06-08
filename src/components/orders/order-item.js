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

class OrderItem extends Component {
	constructor (props) {
		super(props)
		this.state = {
			collapsed: true,
			selecting: false,
			selectedSKUs: [],
			selectedInventory: {},
			loading: false,
			errors: [],
			inventory: {},
			selectingInventory: false
		}
	}

	deleteOrder = oid => {
		this.props.firebase.order(oid).delete()
	}

	toggle = () => {
		this.setState({ collapsed: !this.state.collapsed })
	}

	toggleSelecting = () => {
		if (
			this.props.order.status === types.ORDER_STATUS_CREATED ||
			this.props.order.status === 'CLOSED'
		)
			return
		this.setState({ selecting: !this.state.selecting })
	}

	selectInventory = async () => {
		this.setState({ loading: true })
		let order = this.props.order
		let selectedSKUs = this.state.selectedSKUs
		let inventory = this.state.inventory
		for (let i = 0; i < selectedSKUs.length; i++) {
			let orderProductId = order.products[selectedSKUs[i]].product.pid
			if (utils.isEmpty(inventory[orderProductId])) {
				let snapshot = await this.props.firebase
					.inventoryOfProduct(orderProductId)
					.get()
				if (snapshot.exists) {
					snapshot = snapshot.data()
					inventory[selectedSKUs[i]] = snapshot[selectedSKUs[i]]
				}
			}
		}
		console.log('ii', inventory)
		this.setState({ loading: false, selectingInventory: true, inventory })
	}

	onManifest = async () => {
		let selectedSKUs = this.state.selectedSKUs
		let selectedInventory = this.state.selectedInventory
		let inventory = this.state.inventory
		let order = this.props.order
		this.setState({ loading: true, errors: [], selectingInventory: false })
		let skus = []
		let errors = []
		Object.keys(selectedInventory).map((sku, index) => {
			let f = {}
			f['sku'] = sku
			f['fulfil'] = {
				[selectedInventory[sku]]: order.products[sku]['quantity']
			}
			skus.push(f)
		})
		console.log('prepared skkus', skus)
		let err, _r
		;[err, _r] = await to(initDelivery(order.oid, skus, 'ahmedabad'))
		if (typeof err !== 'undefined' || err !== null) {
			errors.push(err)
		} else {
			console.log(_r)
			if (_r['data']['status'] === 'success') {
				//TODO
			} else {
				errors.push(JSON.stringify(_r['data']['error']))
			}
		}
		this.setState({
			loading: false,
			errors: errors,
			selectedInventory: {},
			selectedSKUs: [],
			selecting: false
		})
	}

	onCancel = async () => {
		let selectedSKUs = this.state.selectedSKUs
		let order = this.props.order
		this.setState({ loading: true, errors: [] })
		let errors = []
		for (let i = 0; i < selectedSKUs.length; i++) {
			let err, _r
			;[err, _r] = await to(cancelProduct(order.oid, selectedSKUs[i]))
			if (_r['data']['status'] === 'error') {
				errors.push(JSON.stringify(_r['data']['error']))
			}
			console.log(_r)
			if (err) errors.push(err)
		}
		this.setState({ loading: false, errors })
	}

	onChecked = event => {
		let selectedSKUs = this.state.selectedSKUs
		let isPresentAt = -1
		for (let i = 0; i < selectedSKUs.length; i++) {
			if (selectedSKUs[i] === event.target.name) {
				isPresentAt = i
				break
			}
		}
		if (isPresentAt > -1) {
			selectedSKUs.splice(isPresentAt, 1)
		} else {
			selectedSKUs.push(event.target.name)
		}
		this.setState({ selectedSKUs })
	}

	isChecked = sku => {
		let selectedSKUs = this.state.selectedSKUs
		let isPresent = selectedSKUs.find(s => s === sku)
		return isPresent ? true : false
	}

	fetchInventory = async (pid, sku) => {
		this.setState({ loading: true })
		return this.props.firebase
			.inventoryOfProduct(pid)
			.onSnapshot(snapshot => {
				let inventory = this.state.inventory
				if (snapshot.exists) {
					snapshot = snapshot.data()
					inventory[sku] = snapshot[sku]
				}

				this.setState({
					inventory,
					loading: false
				})
			})
	}

	onCancelSelectingInventory = () => {
		this.setState({ selectingInventory: false })
	}

	onSelectInventory = event => {
		let selectedInventory = this.state.selectedInventory
		selectedInventory[event.target.name] = event.target.value
		console.log('tri', selectedInventory)
		this.setState({ selectedInventory })
	}

	render () {
		let { order, index, showUid } = this.props
		if (utils.isEmpty(showUid)) {
			showUid = true
		}
		let address = order.address
		let summary = order.summary
		let {
			collapsed,
			selecting,
			selectedSKUs,
			selectedInventory,
			loading,
			errors,
			inventory,
			selectingInventory
		} = this.state

		let canSelectInventory = selectedSKUs.length > 0
		let canCancel = selectedSKUs.length > 0
		let canManifest = true
		for (let i = 0; i < selectedSKUs.length; i++) {
			let sku = selectedSKUs[i]
			let product = order.products[sku]
			let productStatus = product.status
			let productDeliveryStatus = product.delivery.status

			if (utils.isEmpty(selectedInventory[sku])) {
				canManifest = false
			}
			if (productStatus !== types.PRODUCT_STATUS_INIT) {
				canCancel = false
			}
			if (
				productDeliveryStatus !== types.DELIVERY_STATUS_INIT ||
				productStatus === types.PRODUCT_STATUS_CANCELLED ||
				productStatus === types.PRODUCT_STATUS_USER_CANCELLED
			)
				canSelectInventory = false
		}

		return (
			<ListGroupItem
				style={{
					borderLeft: '0px',
					borderBottom: '0px',
					borderRight: '0px'
				}}
			>
				<div onClick={this.toggle} style={{ cursor: 'pointer' }}>
					<Row
						style={{
							fontWeight: 'bold',
							color: collapsed ? '#000000' : '#20a8d8'
						}}
					>
						<Col sm='3'>
							<Row>{index + 1 + ') ' + order.oid}</Row>
						</Col>
						<Col sm='3'>
							<Row>
								<Col>
									{order.product_count +
										(order.product_count > 1
											? ' items '
											: ' item ')}
								</Col>
								<Col>
									{paiseToRupeeString(order.summary.total)}
								</Col>
							</Row>
						</Col>
						<Col sm='6'>
							<Row>
								<Col>
									{timeStampToTimeLocaleString(order.time)}
								</Col>
								<Col>
									<Row>
										<Col>
											{order.payment.mode ===
											types.PAYMENT_STATUS_COD ? (
												<i
													className='fa fa-money'
													aria-hidden='true'
													style={{ color: '#00ff00' }}
												></i>
											) : (
												<i
													className='fa fa-credit-card-alt'
													aria-hidden='true'
													style={{
														color:
															order.payment
																.status ===
															'paid'
																? '#00ff00'
																: '#ffc107'
													}}
												></i>
											)}
										</Col>
										<Col>
											<StatusBadge
												status={order.status}
											/>
										</Col>
										{order.device && (
											<Col>
												<Label>
													{order.device.type}
												</Label>
											</Col>
										)}
										{order.status ===
											types.ORDER_STATUS_CREATED &&
											utils.canDeleteCreatedOrder(
												order
											) && (
												<Button
													type='button'
													color='danger'
													onClick={() => {
														let isConfirmed = window.confirm(
															'Are you sure you want to delete this order?'
														)
														if (isConfirmed) {
															this.deleteOrder(
																order.oid
															)
														}
													}}
												>
													<i className='fa fa-trash'></i>
												</Button>
											)}
									</Row>
								</Col>
							</Row>
						</Col>
					</Row>
					<Row style={{ marginLeft: '15px', marginTop: '5px' }}>
						<Col sm='3'>{address.name}</Col>
						<Col sm='3'>{address.mobile}</Col>
						<Col sm='6'>{beautifyAddress(address)}</Col>
					</Row>
				</div>

				<Collapse isOpen={!collapsed}>
					{selectingInventory && (
						<ListGroup style={{ marginTop: '20px' }}>
							{selectedSKUs.map((sku, index) => {
								const orderProduct = order.products[sku]
								const product = orderProduct.product

								return (
									<ListGroupItem key={index}>
										<Row>
											<Col sm='2.5'>
												<img
													style={{
														maxWidth: '50px',
														maxHeight: '50px'
													}}
													src={product.asset.url}
												/>
											</Col>
											<Col sm='4'>
												<Row>{product.title}</Row>
												<Row>{product.name}</Row>
												<Row>
													{product.option.based_on +
														': ' +
														product.option.name +
														', qty: ' +
														orderProduct.quantity}
												</Row>
											</Col>
											<Col>
												<Input
													type='select'
													name={sku}
													value={
														selectedInventory[sku]
													}
													onChange={
														this.onSelectInventory
													}
												>
													<option value={null}>
														Select Supplier
													</option>
													{Object.keys(
														inventory[sku][
															'inventory'
														]
													).map((supp_id, index) => {
														let supplierInventory =
															inventory[sku][
																'inventory'
															][supp_id]
														return (
															<option
																key={index}
																value={supp_id}
															>
																{supp_id +
																	', stock: ' +
																	supplierInventory[
																		'stock'
																	] +
																	', cp:' +
																	utils.paiseToRupeeString(
																		supplierInventory[
																			'cp'
																		]
																	)}
															</option>
														)
													})}
												</Input>
											</Col>
										</Row>
									</ListGroupItem>
								)
							})}
							<ListGroupItem>
								<Row>
									<Col>
										{canManifest && (
											<Button
												color='primary'
												onClick={this.onManifest}
											>
												Manifest
											</Button>
										)}
									</Col>
									<Col>
										{canCancel && (
											<Button
												color='danger'
												onClick={
													this
														.onCancelSelectingInventory
												}
											>
												Cancel
											</Button>
										)}
									</Col>
								</Row>
							</ListGroupItem>
						</ListGroup>
					)}
					{!selectingInventory && (
						<ListGroup style={{ marginTop: '20px' }}>
							{showUid && (
								<Row>
									<Link
										to={{
											pathname: `${ROUTES.USER_LIST.path}/${order.uid}`
										}}
									>
										{'uid: ' + order.uid}
									</Link>
								</Row>
							)}
							<ListGroupItem>
								<Row>
									<Col sm='1'>
										<i
											className='fa fa-list'
											aria-hidden='true'
											style={{
												color: !selecting
													? '#000000'
													: '#20a8d8',
												cursor: 'pointer'
											}}
											onClick={this.toggleSelecting}
										></i>
									</Col>
									<Col>
										<InputGroup>
											<Label>MRP : </Label>
											<Label>
												{' ' +
													paiseToRupeeString(
														summary.mrp
													)}
											</Label>
										</InputGroup>
									</Col>
									<Col>
										<InputGroup>
											<Label>Discount :</Label>
											<Label>
												{' ' +
													paiseToRupeeString(
														summary.discount
													)}
											</Label>
										</InputGroup>
									</Col>
									<Col>
										{summary &&
											summary.deliveryChargeApplied && (
												<InputGroup>
													<Label>
														Delivery Charge :
													</Label>
													<Label>
														{' ' +
															paiseToRupeeString(
																summary.deliveryCharge
															)}
													</Label>
												</InputGroup>
											)}
									</Col>
									<Col>
										<InputGroup>
											<Label>Total : </Label>
											<Label>
												{' ' +
													paiseToRupeeString(
														summary.total
													)}
											</Label>
										</InputGroup>
									</Col>
								</Row>
							</ListGroupItem>
							{loading && (
								<i className='fa fa-refresh fa-spin fa-3x fa-fw' />
							)}
							{!loading &&
								Object.keys(order.products).map(
									(sku, index) => {
										let orderProduct = order.products[sku]
										let product = orderProduct['product']
										let productStatus = orderProduct.status
										let deliveryStatus =
											orderProduct.delivery.status
										let trackingId =
											orderProduct.delivery.trackingId
										let enabled =
											productStatus !==
												types.PRODUCT_STATUS_USER_CANCELLED &&
											productStatus !==
												types.PRODUCT_STATUS_CANCELLED
										return (
											<ListGroupItem key={index}>
												<Row>
													<Col>
														<Row>
															<Col sm='0.5'>
																{selecting &&
																	enabled && (
																		<Input
																			type='checkbox'
																			name={
																				sku
																			}
																			checked={this.isChecked(
																				sku
																			)}
																			onChange={
																				this
																					.onChecked
																			}
																		/>
																	)}
															</Col>
															<Col sm='2.5'>
																<img
																	style={{
																		maxWidth:
																			'75px',
																		maxHeight:
																			'75px'
																	}}
																	src={
																		product
																			.asset
																			.url
																	}
																/>
															</Col>
															<Col sm='4'>
																<Row
																	style={{
																		fontSize:
																			'1.5em'
																	}}
																>
																	<a
																		href={
																			'https://www.underk.in/p/' +
																			product.slug
																		}
																		target='_blank'
																	>
																		{
																			product.title
																		}
																	</a>
																</Row>
																<Row>
																	{
																		product
																			.category
																			.name
																	}
																</Row>
																<Row
																	style={{
																		fontSize:
																			'1.2em'
																	}}
																>
																	{product
																		.option
																		.based_on +
																		': ' +
																		product
																			.option
																			.name +
																		', qty: ' +
																		orderProduct.quantity}
																</Row>
																{product.attributes &&
																	product
																		.attributes
																		.color && (
																		<Row
																			style={{
																				fontSize:
																					'1.2em'
																			}}
																		>
																			{'Color : ' +
																				product
																					.attributes
																					.color
																					.name}
																		</Row>
																	)}
															</Col>
															<Col sm='6'>
																<Row>
																	<Col>
																		{'Price: ' +
																			paiseToRupeeString(
																				product.listPrice
																			)}
																	</Col>
																	<Col>
																		{'Discount: ' +
																			paiseToRupeeString(
																				product.discount
																			)}
																	</Col>
																	<Col>
																		{'Quantity: ' +
																			orderProduct.quantity}
																	</Col>
																	<Col>
																		{'Total: ' +
																			paiseToRupeeString(
																				(product.listPrice -
																					product.discount) *
																					orderProduct.quantity
																			)}
																	</Col>
																</Row>
																<Row
																	style={{
																		marginTop:
																			'20px'
																	}}
																>
																	<Col>
																		<Label
																			style={{
																				marginRight:
																					'20px'
																			}}
																		>
																			Product
																			Status
																			:
																		</Label>

																		<StatusBadge
																			status={
																				productStatus
																			}
																		/>
																	</Col>
																	<Col>
																		<Label
																			style={{
																				marginRight:
																					'20px'
																			}}
																		>
																			Delivery
																			Status
																			:
																		</Label>

																		<StatusBadge
																			status={
																				deliveryStatus
																			}
																		/>
																	</Col>
																	{trackingId && (
																		<Col>
																			<a
																				href={
																					'https://www.underk.in/track/' +
																					trackingId
																				}
																				target='_blank'
																			>
																				Track
																			</a>
																		</Col>
																	)}
																</Row>
															</Col>
														</Row>
													</Col>
												</Row>
											</ListGroupItem>
										)
									}
								)}
							{
								<ListGroupItem>
									<Row>
										<Col>
											{canSelectInventory && (
												<Button
													color='primary'
													onClick={
														this.selectInventory
													}
												>
													Select Inventory
												</Button>
											)}
										</Col>
										<Col>
											{canCancel && (
												<Button
													color='danger'
													onClick={this.onCancel}
												>
													Cancel
												</Button>
											)}
										</Col>
									</Row>
								</ListGroupItem>
							}

							{errors.map((error, index) => {
								if (
									error !== null &&
									typeof error !== 'undefined'
								)
									return (
										<ListGroupItem
											style={{ color: 'red' }}
											key={index}
										>
											{error.toString()}
										</ListGroupItem>
									)
								else return <div key={index}></div>
							})}
						</ListGroup>
					)}
				</Collapse>
			</ListGroupItem>
		)
	}
}

export default OrderItem
