import React, { Component } from 'react'
import { withFirebase } from '../../firebase'
import * as utils from '../../utils'
import types from 'underk-types'

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
	ListGroupItemHeading,
	ListGroupItemText,
	Collapse,
	Alert
} from 'reactstrap'
import isString from 'lodash/fp/isString'

class TestPlayground extends Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: false,
			orders: [],
			addresses: []
		}
	}

	componentDidMount () {
		// this.setState({ loading: true })
		// this.unsubscribe = this.props.firebase
		// 	.orders()
		// 	.get()
		// 	.then(snapshot => {
		// 		let orders = []
		// 		snapshot.forEach(doc =>
		// 			orders.push({ ...doc.data(), id: doc.id })
		// 		)
		// 		console.log(orders)
		// 		this.setState({
		// 			orders,
		// 			loading: false
		// 		})
		// 	})
		// this.props.firebase
		// 	.addresses()
		// 	.get()
		// 	.then(snapshot => {
		// 		let addresses = []
		// 		snapshot.forEach(doc =>
		// 			addresses.push({ ...doc.data(), id: doc.id })
		// 		)
		// 		console.log(addresses)
		// 		this.setState({
		// 			addresses,
		// 			loading: false
		// 		})
		// 	})
	}

	componentWillUnmount () {}

	generateProductsCSV = async event => {
		this.setState({ loading: true })

		let products = await this.props.firebase.products().get()
		products = products.docs
		
		this.setState({ loading: false })
	}

	// clickMe = async event => {
	// 	let orders = this.state.orders
	// 	this.setState({ loading: true })
	// 	let count = 0
	// 	for (let i = 0; i < orders.length; i++) {
	// 		let order = orders[i]
	// 		let address = order.address
	// 		if (isString(address.pincode)) {
	// 			console.log(address.pincode)
	// 			order.address.pincode = Number(address.pincode)
	// 			console.log(order.id)
	// 			await this.props.firebase
	// 				.order(order.id)
	// 				.set(order, { merge: true })
	// 		}
	// 	}
	// 	console.log(count)

	// 	this.setState({ loading: false })

	// 	return
	// }

	// clickMe2 = async event => {
	// 	let addresses = this.state.addresses
	// 	this.setState({ loading: true })
	// 	let count = 0
	// 	for (let i = 0; i < addresses.length; i++) {
	// 		let address = addresses[i]
	// 		if (isString(address.pincode)) {
	// 			count++
	// 			console.log(address.pincode)
	// 			address.pincode = Number(address.pincode)
	// 			console.log(address.id)
	// 			await this.props.firebase
	// 				.address(address.id)
	// 				.set(address, { merge: true })
	// 		}
	// 	}
	// 	console.log(count)

	// 	this.setState({ loading: false })

	// 	return
	// }

	render () {
		let { loading } = this.state
		return (
			<Card>
				<CardHeader>Developer's Testing Playground</CardHeader>
				<CardBody>
					{loading && (
						<i className='fa fa-refresh fa-spin fa-3x fa-fw' />
					)}
					{!loading && (
						<>
							<Button disabled
								color='danger'
								onClick={this.generateProductsCSV}
							>
								Click Me only if you know what you are doing
							</Button>
						</>
					)}
				</CardBody>
			</Card>
		)
	}
}
export default withFirebase(TestPlayground)
