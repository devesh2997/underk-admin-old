import React, { Component } from 'react'

import ReturnOrderItem from './return-order-item'
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

class ReturnsOnDate extends Component {
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
		let { returns, date, showUid } = this.props

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
							{returns.map((returnRequest, index) => {
								return (
									<ReturnOrderItem
										key={index}
										returnRequest={returnRequest}
										index={index}
										firebase={this.props.firebase}
										showUid={showUid}
									/>
								)
							})}
						</ListGroup>
					</CardBody>
				</Collapse>
			</Card>
		)
	}
}

export default ReturnsOnDate
