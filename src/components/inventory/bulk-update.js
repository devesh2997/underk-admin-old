import React, { Component } from 'react'
import { withFirebase } from '../../firebase'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { Form, FormGroup, Input, Label, Button } from 'reactstrap'
import CSVReader from 'react-csv-reader'

import {
	Container,
	ListGroup,
	ListGroupItem,
	ListGroupItemHeading,
	ListGroupItemText,
	Badge,
	Row,
	Col,
	Spinner,
	InputGroup,
	InputGroupAddon,
	InputGroupText
} from 'reactstrap'
import { isEmpty } from '../../utils'
import { setStock } from './utils'

class BulkUpdateInventory extends Component {
	constructor (props) {
		super(props)

		this.state = {
			updatingInventory: false,
			loadingProducts: false,
			loadingInventory: false,
			products: null,
			inventory: null,
			errors: [],
			validInventory: [],
			totalCSVRows: 0
		}
	}

	componentDidMount () {
		this.setState({ loadingProducts: true, loadingInventory: true })
		this.getProducts = this.props.firebase
			.products()
			.get()
			.then(snapshot => {
				let products = []

				snapshot.forEach(doc =>
					products.push({ ...doc.data(), pid: doc.id })
				)

				this.setState({
					products,
					loadingProducts: false
				})
			})
		this.getInventory = this.props.firebase
			.inventory()
			.get()
			.then(snapshot => {
				let inventory = []

				snapshot.forEach(doc =>
					inventory.push({ ...doc.data(), pid: doc.id })
				)

				this.setState({
					inventory,
					loadingInventory: false
				})
			})
	}

	fetchProducts = async () => {
		this.setState({ loading: true })
	}

	handleFileSelection = async csvdata => {
		let totalCSVRows = 0
		let validInventory = []
		let errors = []
		console.log(csvdata)

		let { products, inventory } = this.state

		for (let i in csvdata) {
			let row = csvdata[i]
			if (
				isEmpty(row[0]) ||
				isEmpty(row[1]) ||
				isEmpty(row[2]) ||
				isEmpty(row[3])
			) {
				continue
			}
			totalCSVRows++
			try {
				let pid = row[0]
				let sku = row[1]
				let supplier = row[2]
				let quantity = Number(row[3])

				if (isNaN(quantity)) {
					throw 'Quantity must be a number'
				}
				if (quantity < 0) {
					throw 'Quantity must be positive'
				}
				if (!products.some(p => p.pid === pid)) {
					throw 'Product with given id does not exist'
				}
				const product = products.find(p => p.pid === pid)
				if (!product.options.skus[sku]) {
					throw 'Given sku does not exist for the product'
				}
				if (!inventory.some(i => i.pid === pid)) {
					throw 'Inventory does exist for given product, contact Devesh ASAP'
				}

				const productInventory = inventory.find(i => i.pid === pid)
				if (!productInventory[sku]) {
					throw 'Inventory does not exist for given product sku, contact Devesh ASAP'
				}

				if (!productInventory[sku]['inventory'][supplier]) {
					throw 'Given supplier does not exist for given product'
				}

				if (quantity < productInventory[sku]['reserved']) {
					throw 'Given quantity is less than reserved stock of this sku. Contact Devesh ASAP'
				}

				const stockSet = { sku: sku, set: { [supplier]: quantity } }
				validInventory.push({
					pid: pid,
					stockSet: stockSet,
					reason: 'Bulk updating inventory'
				})
			} catch (error) {
				let errorrow = Number(i) + 1
				errors.push('Row : ' + errorrow + ', Error : ' + error)
				console.log('Row : ', errorrow, ', Error : ', error)
			}
		}

		this.setState({ totalCSVRows, validInventory, errors })
	}

	updateInventory = async () => {
		this.setState({ updatingInventory: true })
		const { validInventory } = this.state

		for (let inventory in validInventory) {
			const i = validInventory[inventory]
			await setStock(this.props.firebase.db, i.pid, i.stockSet, i.reason)
		}

		this.setState({ updatingInventory: false })
	}

	render () {
		const {
			updatingInventory,
			products,
			errors,
			validInventory,
			totalCSVRows,
			loadingProducts,
			loadingInventory
		} = this.state

		const loading = loadingProducts || loadingInventory || updatingInventory

		let errorTexts = []
		for (let i = 0; i < errors.length; i++) {
			errorTexts.push(<div key={i}>{errors[i]}</div>)
		}

		return (
			<Card>
				<CardHeader>Inventory Bulk Update</CardHeader>
				{loading && <i className='fa fa-refresh fa-spin fa-3x fa-fw' />}
				{!loading && (
					<CardBody>
						<InputGroup>
							<InputGroupAddon addonType='prepend'>
								<InputGroupText>Choose CSV file</InputGroupText>
							</InputGroupAddon>
							<CSVReader
								cssClass='csv-reader-input'
								label=''
								onFileLoaded={this.handleFileSelection}
								onError={this.handleFileSelectionError}
								inputId='ObiWan'
								inputStyle={{}}
							/>
						</InputGroup>
						{totalCSVRows > 0 ? (
							<div>{errorTexts}</div>
						) : (
							<div></div>
						)}
						{validInventory.length > 0 && (
							<div style={{ marginTop: '10px' }}>
								<Row>
									<Button
										color='primary'
										onClick={this.updateInventory}
									>
										Update inventory
									</Button>
								</Row>
								<Row style={{ marginTop: '10px' }}>
									<ListGroup>
										{validInventory.map(
											(productInventory, index) => {
												return (
													<ListGroupItem key={index}>
														<ListGroupItemText>
															{index +
																1 +
																') ' +
																productInventory.pid +
																'    ' +
																JSON.stringify(
																	productInventory.stockSet
																)}
														</ListGroupItemText>
													</ListGroupItem>
												)
											}
										)}
									</ListGroup>
								</Row>
							</div>
						)}
					</CardBody>
				)}
			</Card>
		)
	}
}

export default withFirebase(BulkUpdateInventory)
