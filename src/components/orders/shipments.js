import React, { Component, useState, useEffect } from 'react'
import {
	timeStampToLocaleString,
	isEmpty,
	beautifyAddress
} from '../../utils/index'
import types from 'underk-types'
import classnames from 'classnames'
import ROUTES from '../../routes'
import { Link } from 'react-router-dom'

import {
	ListGroup,
	Nav,
	TabPane,
	NavItem,
	NavLink,
	TabContent,
	Badge,
	Row,
	Col,
	CardHeader,
	Card,
	CardBody
} from 'reactstrap'

const Shipments = props => {
	const [tabs, setTabs] = useState([])
	const [activeTab, setActiveTab] = useState(types.DELIVERY_STATUS_MANIFESTED)
	const [shipments, setShipments] = useState({})

	useEffect(() => {
		const orders = props.orders
		orders.sort((a, b) => a.time)
		const shipments = {}

		for (let i = 0; i < orders.length; i++) {
			const order = orders[i]
			const oid = order.id
			const orderProductSkus = Object.keys(order.products)
			for (let j = 0; j < orderProductSkus.length; j++) {
				const orderProduct = order.products[orderProductSkus[j]]
				const deliveryStatus = orderProduct.delivery.status
				if (isEmpty(orderProduct.delivery.trackingId)) continue
				const trackingId = orderProduct.delivery.trackingId
				if (isEmpty(shipments[deliveryStatus])) {
					shipments[deliveryStatus] = {}
				}
				if (isEmpty(shipments[deliveryStatus][oid])) {
					shipments[deliveryStatus][oid] = {
						time: order.time,
						oid: oid,
						uid: order.uid,
						address: order.address,
						status: order.status,
						payment: order.payment,
						summary: order.summary,
						shipments: {}
					}
				}
				if (
					isEmpty(
						shipments[deliveryStatus][oid]['shipments'][trackingId]
					)
				) {
					shipments[deliveryStatus][oid]['shipments'][trackingId] = {
						delivery: orderProduct.delivery,
						products: []
					}
				}
				shipments[deliveryStatus][oid]['shipments'][trackingId][
					'products'
				].push({
					quantity: orderProduct.quantity,
					details: orderProduct.product
				})
			}
		}
		setShipments(shipments)
		if (isEmpty(shipments[types.DELIVERY_STATUS_MANIFESTED])) {
			setActiveTab(types.DELIVERY_STATUS_IN_TRANSIT)
		}
	}, [])
	console.log(shipments)

	return (
		<div>
			<Nav tabs>
				{Object.keys(shipments).map((shipmentStatus, i) => (
					<NavItem key={shipmentStatus}>
						<NavLink
							className={classnames({
								active: activeTab === shipmentStatus
							})}
							onClick={() => {
								setActiveTab(shipmentStatus)
							}}
						>
							{capitalizeFirstLetter(shipmentStatus)}{' '}
							<Badge color='primary'>
								{getShipmentsCount(shipments[shipmentStatus])}
							</Badge>
						</NavLink>
					</NavItem>
				))}
			</Nav>
			<TabContent activeTab={activeTab}>
				{Object.keys(shipments).map((shipmentStatus, i) => {
					const orders = shipments[shipmentStatus]
					return (
						<TabPane tabId={shipmentStatus} key={shipmentStatus}>
							<ListGroup>
								{Object.keys(orders).map(oid => (
									<OrderWithShipments
										key={oid}
										order={orders[oid]}
									/>
								))}
							</ListGroup>
						</TabPane>
					)
				})}
			</TabContent>
		</div>
	)
}

const capitalizeFirstLetter = string =>
	string.charAt(0).toUpperCase() + string.slice(1)

const OrderWithShipments = ({ order }) => {
	const trackingIds = Object.keys(order.shipments)
	const address = order.address
	return (
		<ListGroup>
			{trackingIds.map(trackingId => {
				const shipment = order.shipments[trackingId]
				const delivery = shipment.delivery
				const products = shipment.products
				const time = delivery.time
				let latestUpdate = null
				let latestUpdateTime = 0
				let updates = []
				if (time) updates = Object.keys(time)
				for (let i = 0; i < updates.length; i++) {
					if (updates[i] === 'lastUpdatedOn') continue
					if (time[updates[i]] > latestUpdateTime) {
						latestUpdateTime = time[updates[i]]
						latestUpdate = updates[i]
					}
				}
				return (
					<Card key={trackingId}>
						<CardHeader>
							<Row>
								<Col sm='2'>
									<a
										href={
											'https://www.underk.in/track/' +
											trackingId
										}
										target='_blank'
									>
										{trackingId}
									</a>
								</Col>
								<Col sm='2'>{order.oid}</Col>
								<Col>
									<b>uid:</b>{' '}
									<Link
										to={{
											pathname: `${ROUTES.USER_LIST.path}/${order.uid}`
										}}
									>
										{order.uid}
									</Link>
								</Col>
								<Col>
									<b>placedOn:</b>{' '}
									{timeStampToLocaleString(order.time)}
								</Col>
								<Col>
									<b>{latestUpdate}:</b>{' '}
									{timeStampToLocaleString(latestUpdateTime)}
								</Col>
							</Row>
						</CardHeader>
						<CardBody>
							<Row>
								<Col sm='2'>{address.name}</Col>
								<Col sm='2'>{address.mobile}</Col>
								<Col sm='8'>{beautifyAddress(address)}</Col>
							</Row>
							<Row style={{ marginTop: '10px' }}>
								{products.map(op => {
									const product = op.details
									const quantity = op.quantity
									return (
										<Col key={product.pid}>
											<Row>
												<Col sm='2.5'>
													<img
														style={{
															maxWidth: '75px',
															maxHeight: '75px'
														}}
														src={product.asset.url}
													/>
												</Col>
												<Col sm='4'>
													<Row
														style={{
															fontSize: '1.2em'
														}}
													>
														<a
															href={
																'https://www.underk.in/p/' +
																product.slug
															}
															target='_blank'
														>
															{product.title}
														</a>
													</Row>
													<Row>
														{product.category.name}
													</Row>
													<Row>
														{product.option
															.based_on +
															': ' +
															product.option
																.name +
															', qty: ' +
															quantity}
													</Row>
													{product.attributes &&
														product.attributes
															.color && (
															<Row>
																{'Color : ' +
																	product
																		.attributes
																		.color
																		.name}
															</Row>
														)}
												</Col>
											</Row>
										</Col>
									)
								})}
							</Row>
						</CardBody>
					</Card>
				)
			})}
		</ListGroup>
	)
}

const getShipmentsCount = shipments => {
	let count = 0
	const orders = Object.keys(shipments)

	for (let i = 0; i < orders.length; i++) {
		count += Object.keys(shipments[orders[i]].shipments).length
	}

	return count
}

export default Shipments
