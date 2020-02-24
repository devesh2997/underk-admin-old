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
			collapsed: true,
			selecting: false,
			selectedSKUs: [],
			loading: false,
			errors: []
		}
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

	onChecked = event => {
		let order = this.props.order
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

	render () {
		let { order, index, showUid, collapsed } = this.props

		if (utils.isEmpty(showUid)) {
			showUid = true
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
					</Row>
				</div>
			</ListGroupItem>
		)
	}
}

export default ReturnOrderItem
