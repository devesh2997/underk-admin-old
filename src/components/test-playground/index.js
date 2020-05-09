import React, { Component } from 'react'
// import { withFirebase } from '../../firebase'
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

class TestPlayground extends Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: false,
			products: []
		}
	}

	componentDidMount () {
		this.setState({ loading: true })

		this.unsubscribe = this.props.firebase
			.products()
			.onSnapshot(snapshot => {
				let products = []
				snapshot.forEach(doc =>
					products.push({ ...doc.data(), id: doc.id })
                )
                console.log(products)

				this.setState({
					products,
					loading: false
				})
			})
	}

	componentWillUnmount () {
		this.unsubscribe()
	}

	clickMe = async event => {
		let products = this.state.products
		this.setState({ loading: true })
		for (let i = 0; i < products.length; i++) {
			let product = products[i]
			if (utils.isEmpty(product.category.slugFamilyMap)) {
				let map = {}
				for (let j = 0; j < product.category.slugFamily.length; j++) {
					const slug = product.category.slugFamily[j]
					map[slug] = true
				}
				product.category.slugFamilyMap = map
			}
			if (utils.isEmpty(product.collectionsMap)) {
				let map = {}
				for (let i = 0; i < product.collections.length; i++) {
					const collection = product.collections[i]
					map[collection] = true
				}
				product.collectionsMap = map
			}
			await this.props.firebase
				.product(product.id)
				.set(product, { merge: true })
		}

		this.setState({ loading: false })

		return
	}

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
						<Button color='danger' onClick={this.clickMe}>
							Click Me only if you know what you are doing
						</Button>
					)}
				</CardBody>
			</Card>
		)
	}
}
// export default withFirebase(TestPlayground)
