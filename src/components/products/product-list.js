import React, { Component } from 'react'
import {
	Card,
	CardBody,
	CardHeader,
	Row,
	InputGroup,
	Input,
	InputGroupAddon,
	InputGroupText,
	Col,
	Button
} from 'reactstrap'
import { withFirebase } from '../../firebase'
import ProductCard from './product-card'

class ProductListBase extends Component {
	constructor (props) {
		super(props)
		this.state = {
			withCategory: 'all',
			loading: false,
			products: [],
			categories: []
		}
	}

	componentDidMount () {
		this.props.firebase
			.categories()
			.get().then(snapshot => {
				let categories = []

				snapshot.forEach(doc =>
					categories.push({ ...doc.data(), cid: doc.id })
				)

				this.setState({ categories })
			})
		this.getProducts()
	}

	onChange = event => {
		if (this.state[event.target.name] !== event.target.value) {
			if (event.target.name === 'withCategory') {
				this.setState({
					[event.target.name]: event.target.value
				}, this.getProducts)
				console.log(event.target.value)
			}
		}
	}

	getProducts = () => {
		this.setState({ loading: true })
		this.unsubscribe && this.unsubscribe();
		this.unsubscribe = this.props.firebase
			.productsWithCategory(this.state.withCategory)
			.onSnapshot(snapshot => {
				let products = []
				snapshot.forEach(doc =>
					products.push({ ...doc.data(), pid: doc.id })
				)

				this.setState({
					products,
					loading: false
				})
			})
	}

	render () {
		const { loading, products, categories, withCategory } = this.state

		return (
			<Card>
				<CardHeader>
					<h4>Products</h4>
				</CardHeader>
				<CardBody>
					{loading && (
						<div className='animated fadeIn pt-3 text-center'>
							Loading...
						</div>
					)}
					{!loading && (
						<Row>
							<Col>
								<InputGroup>
									<InputGroupAddon addonType='prepend'>
										<InputGroupText>
											Category
										</InputGroupText>
									</InputGroupAddon>
									<Input
										type='select'
										name='withCategory'
										value={withCategory}
										onChange={this.onChange}
									>
										<option value='all'>all</option>
										{categories.map(c => (
											<option key={c.id} value={c.cid}>
												{c.cid}
											</option>
										))}
									</Input>
								</InputGroup>
							</Col>
							<Col sm={2}>
								<Button
									color='primary'
									onClick={this.getProducts}
								>
									Get
								</Button>
							</Col>
						</Row>
					)}
					<Row>
						{products.map(product => (
							<ProductCard key={product.pid} product={product} />
						))}
					</Row>
				</CardBody>
			</Card>
		)
	}
}

export default withFirebase(ProductListBase)
