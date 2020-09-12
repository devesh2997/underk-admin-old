import React, { Component, useState, useEffect } from 'react'
import { parseOrdersToArrangeByDate, addDays } from '../../utils/index'
import OrdersOnDate from './orders-by-date'
import types from 'underk-types'
import classnames from 'classnames'

import {
	ListGroup,
	Nav,
	TabPane,
	NavItem,
	NavLink,
	TabContent
} from 'reactstrap'

const Orders = props => {
	const [createdOrders, setCreatedOrders] = useState([])
	const [placedOrders, setPlacedOrders] = useState([])
	const [dormantOrders, setDormantOrders] = useState([])
	const [closedOrders, setClosedOrders] = useState([])
	const [activeOrders, setActiveOrders] = useState([])
	const [orders, setOrders] = useState([])

	const [activeTab, setActiveTab] = useState(types.ORDER_STATUS_PLACED)

	useEffect(() => {
		const orders = props.orders
		setCreatedOrders(
			parseOrdersToArrangeByDate(
				orders.filter(
					order => order.status === types.ORDER_STATUS_CREATED
				)
			)
		)

		setPlacedOrders(
			parseOrdersToArrangeByDate(
				orders.filter(
					order => order.status === types.ORDER_STATUS_PLACED
				)
			)
		)

		setActiveOrders(
			parseOrdersToArrangeByDate(
				orders.filter(
					order => order.status === types.ORDER_STATUS_ACTIVE
				)
			)
		)

		setDormantOrders(
			parseOrdersToArrangeByDate(
				orders.filter(
					order => order.status === types.ORDER_STATUS_DORMANT
				)
			)
		)

		setClosedOrders(
			parseOrdersToArrangeByDate(
				orders.filter(
					order => order.status === types.ORDER_STATUS_CLOSED
				)
			)
		)

		setOrders(parseOrdersToArrangeByDate(orders))
	}, [])

	return (
		<div>
			<Nav tabs>
				<NavItem>
					<NavLink
						className={classnames({
							active: activeTab === 'ALL'
						})}
						onClick={() => {
							setActiveTab('ALL')
						}}
					>
						All
					</NavLink>
				</NavItem>
				<NavItem>
					<NavLink
						className={classnames({
							active: activeTab === types.ORDER_STATUS_PLACED
						})}
						onClick={() => {
							setActiveTab(types.ORDER_STATUS_PLACED)
						}}
					>
						Placed
					</NavLink>
				</NavItem>
				<NavItem>
					<NavLink
						className={classnames({
							active: activeTab === types.ORDER_STATUS_ACTIVE
						})}
						onClick={() => {
							setActiveTab(types.ORDER_STATUS_ACTIVE)
						}}
					>
						Active
					</NavLink>
				</NavItem>
				<NavItem>
					<NavLink
						className={classnames({
							active: activeTab === types.ORDER_STATUS_DORMANT
						})}
						onClick={() => {
							setActiveTab(types.ORDER_STATUS_DORMANT)
						}}
					>
						Dormant
					</NavLink>
				</NavItem>
				<NavItem>
					<NavLink
						className={classnames({
							active: activeTab === types.ORDER_STATUS_CLOSED
						})}
						onClick={() => {
							setActiveTab(types.ORDER_STATUS_CLOSED)
						}}
					>
						Closed
					</NavLink>
				</NavItem>
				<NavItem>
					<NavLink
						className={classnames({
							active: activeTab === types.ORDER_STATUS_CREATED
						})}
						onClick={() => {
							setActiveTab(types.ORDER_STATUS_CREATED)
						}}
					>
						Created
					</NavLink>
				</NavItem>
			</Nav>
			<TabContent activeTab={activeTab}>
				<TabPane tabId={'ALL'}>
					<ListGroup style={{ marginTop: '20px' }}>
						{orders.map((order, index) => {
							return (
								<OrdersOnDate
									key={index}
									orders={order.orders}
									date={order.date}
									firebase={props.firebase}
								/>
							)
						})}
					</ListGroup>
				</TabPane>
				<TabPane tabId={types.ORDER_STATUS_PLACED}>
					<ListGroup style={{ marginTop: '20px' }}>
						{placedOrders.map((order, index) => {
							return (
								<OrdersOnDate
									key={index}
									orders={order.orders}
									date={order.date}
									firebase={props.firebase}
								/>
							)
						})}
					</ListGroup>
				</TabPane>
				<TabPane tabId={types.ORDER_STATUS_ACTIVE}>
					<ListGroup style={{ marginTop: '20px' }}>
						{activeOrders.map((order, index) => {
							return (
								<OrdersOnDate
									key={index}
									orders={order.orders}
									date={order.date}
									firebase={props.firebase}
								/>
							)
						})}
					</ListGroup>
				</TabPane>
				<TabPane tabId={types.ORDER_STATUS_DORMANT}>
					<ListGroup style={{ marginTop: '20px' }}>
						{dormantOrders.map((order, index) => {
							return (
								<OrdersOnDate
									key={index}
									orders={order.orders}
									date={order.date}
									firebase={props.firebase}
								/>
							)
						})}
					</ListGroup>
				</TabPane>
				<TabPane tabId={types.ORDER_STATUS_CLOSED}>
					<ListGroup style={{ marginTop: '20px' }}>
						{closedOrders.map((order, index) => {
							return (
								<OrdersOnDate
									key={index}
									orders={order.orders}
									date={order.date}
									firebase={props.firebase}
								/>
							)
						})}
					</ListGroup>
				</TabPane>
				<TabPane tabId={types.ORDER_STATUS_CREATED}>
					<ListGroup style={{ marginTop: '20px' }}>
						{createdOrders.map((order, index) => {
							return (
								<OrdersOnDate
									key={index}
									orders={order.orders}
									date={order.date}
									firebase={props.firebase}
								/>
							)
						})}
					</ListGroup>
				</TabPane>
			</TabContent>
		</div>
	)
}

export default Orders
