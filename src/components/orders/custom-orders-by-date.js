import React, { Component } from 'react'

import OrderItem from './order-item'
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

class CustomOrdersOnDate extends Component {
	constructor (props) {
		super(props)
		this.state = {
			collapsed: false
		}
	}

	toggle = () => {
		this.setState({ collapsed: !this.state.collapsed })
	}

	render () {
		let { orders, date, showUid } = this.props
		return (
			<Card>
				<CardHeader onClick={this.toggle} style={{ cursor: 'pointer' }}>
					<span style={{ marginRight: '10px' }}>
						{this.state.collapsed ? (
							<i
								className='fa fa-chevron-down'
								aria-hidden='true'
							></i>
						) : (
							<i
								className='fa fa-chevron-up'
								aria-hidden='true'
							></i>
						)}
					</span>
					{timeStampToDateLocaleString(
						new Date(parseInt(date)).getTime()
					)}
				</CardHeader>
				<Collapse isOpen={!this.state.collapsed}>
					<CardBody style={{ margin: '0px', padding: '0px' }}>
						<ListGroup>
							{orders.map((order, index) => {
								return (
									<ListGroupItem>
										{JSON.stringify(order)}
									</ListGroupItem>
								)
							})}
						</ListGroup>
					</CardBody>
				</Collapse>
			</Card>
		)
	}
}

export default CustomOrdersOnDate
