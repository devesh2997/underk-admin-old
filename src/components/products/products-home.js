import React, { Component } from 'react'
import { withFirebase } from '../../firebase'
import { isEmpty } from '../../utils'

import {
	Button,
	Container,
	Card,
	CardBody,
	CardHeader,
	Spinner,
	Row,
	Col,
	InputGroup,
	InputGroupAddon,
	InputGroupText
} from 'reactstrap'
import { CSVLink } from 'react-csv'
import CSVReader from 'react-csv-reader'

class ProductsHome extends Component {
	constructor (props) {
		super(props)
		this.state = {
			generatingVariants: false,
			preparingProductPriceCSV: false,
			preparingProductInfoCSV: false,
			productPriceCSVData: [],
			productInfoCSVData: [],
			loading: false,
			products: null,
			errors: [],
			validProducts: []
		}
	}

	updateProductsPrice = async () => {
		this.setState({ loading: true })
		const { validProducts } = this.state

		for (let i = 0; i < validProducts.length; i++) {
			const validProduct = validProducts[i]
			console.log(validProduct)
			const discount = validProduct.listPrice - validProduct.sellingPrice
			await this.props.firebase.product(validProduct.pid).set(
				{
					listPrice: validProduct.listPrice,
					sellingPrice: validProduct.sellingPrice,
					discount: discount
				},
				{ merge: true }
			)
		}

		this.setState({ loading: false })
	}

	handleFileSelection = async csvdata => {
		let totalCSVRows = 0
		let validProducts = []
		let errors = []

		let snapshots = await this.props.firebase.products().get()
		snapshots = snapshots.docs

		let products = []
		snapshots.forEach(snapshot =>
			products.push({ ...snapshot.data(), pid: snapshot.id })
		)

		for (let i in csvdata) {
			let row = csvdata[i]
			if (row[0] === 'pid') continue
			if (
				isEmpty(row[0]) ||
				isEmpty(row[1]) ||
				isEmpty(row[2]) ||
				isEmpty(row[3]) ||
				isEmpty(row[4]) ||
				isEmpty(row[5])
			) {
				continue
			}
			totalCSVRows++
			try {
				let pid = row[0]
				const product = products.find(p => p.pid === pid)
				if (typeof product === 'undefined') {
					throw 'Product with pid ' + pid + ' not found'
				}
				const listPrice = Number(row[4])
				const sellingPrice = Number(row[5])
				if (isNaN(listPrice)) {
					throw 'Invalid list price'
				}
				if (isNaN(sellingPrice)) {
					throw 'Invalid selling price'
				}
				if (sellingPrice > listPrice) {
					throw 'Selling price is more than list price'
				}
				validProducts.push({ pid, sellingPrice, listPrice })
			} catch (error) {
				let errorrow = Number(i) + 1
				errors.push('Row : ' + errorrow + ', Error : ' + error)
				console.log('Row : ', errorrow, ', Error : ', error)
			}
		}

		this.setState({ totalCSVRows, validProducts, errors })
	}

	prepareProductPriceCSV = async () => {
		this.setState({ preparingProductPriceCSV: true })

		let snapshots = await this.props.firebase.products().get()
		snapshots = snapshots.docs
		let products = []
		snapshots.forEach(snapshot =>
			products.push({ ...snapshot.data(), pid: snapshot.id })
		)
		let csvData = products.map(product => {
			const pid = product.pid
			const title = product.title
			const category = product.category.name
			const slug = product.slug
			const listPrice = product.listPrice
			const sellingPrice = product.sellingPrice
			return {
				pid,
				title,
				slug,
				category,
				listPrice,
				sellingPrice
			}
		})
		this.setState({
			preparingProductPriceCSV: false,
			productPriceCSVData: csvData
		})
	}

	prepareProductInfoCSV = async () => {
		this.setState({ preparingProductInfoCSV: true })

		let snapshots = await this.props.firebase.products().get()
		snapshots = snapshots.docs
		let products = []
		snapshots.forEach(snapshot =>
			products.push({ ...snapshot.data(), pid: snapshot.id })
		)
		let csvData = products.map(product => {
			const pid = product.pid
			const title = product.title
			const category = product.category.name
			const slug = product.slug
			const listPrice = product.listPrice
			const sellingPrice = product.sellingPrice
			const type = product.type.name
			const subtype = product.subtype.name

			let data = {
				pid,
				title,
				slug,
				category,
				listPrice,
				sellingPrice
			}

			const attributes = Object.keys(product.attributes)

			for (let i = 0; i < attributes.length; i++) {
				data = {
					...data,
					[attributes[i]]:
						product['attributes'][attributes[i]]['name']
				}
			}

			return data
		})

		this.setState({
			preparingProductInfoCSV: false,
			productInfoCSVData: csvData
		})
	}

	generateVariants = async () => {
		this.setState({ generatingVariants: true })
		let typesSnapshots = await this.props.firebase.typesSubtypes().get()
		let types = {}
		typesSnapshots.forEach(doc => (types[doc.id] = { ...doc.data() }))

		this.setState({ types, loadingTypes: false })
		let products = await this.props.firebase.products().get()
		products = products.docs
		// console.log(products)
		for (let i = 0; i < products.length; i++) {
			let product = products[i]
			product = product.data()
			const type = product.type.sku
			const subtype = product.subtype.sku
			const skuOrdering = types[type].subtypes[subtype].skuOrdering
			const variantsBasis = types[type].subtypes[subtype].variantsBasis

			console.log('generating for : ', product.pid)
			let variants = this.props.firebase
				.products()
				.where('type.sku', '==', type)
				.where('gender', '==', product.gender)
				.where('category.cid', '==', product.category.cid)
				.where('subtype.sku', '==', subtype)

			for (let j = 0; j < skuOrdering.length; j++) {
				console.log(skuOrdering[j])
				if (isEmpty(variantsBasis.find(v => v === skuOrdering[j]))) {
					console.log('not empty')
					variants = variants.where(
						'attributes.' + skuOrdering[j],
						'==',
						product.attributes[skuOrdering[j]]
					)
				}
			}
			variants = await variants.get()
			variants.forEach(async variant => {
				if (variant.exists) {
					console.log('variant found : ', variant.id)
					await this.props.firebase.db
						.doc(`products/${product.pid}/variants/${variant.id}`)
						.set({
							pid: variant.id,
							type: 'color',
							value: variant.data().attributes.color,
							slug: variant.data().slug
						})
				}
			})
		}
		this.setState({ generatingVariants: false })
	}

	render () {
		const {
			generatingVariants,
			preparingProductPriceCSV,
			preparingProductInfoCSV,
			productPriceCSVData,
			productInfoCSVData,
			loading,
			errors,
			totalCSVRows,
			validProducts
		} = this.state

		let errorTexts = []
		for (let i = 0; i < errors.length; i++) {
			errorTexts.push(<div key={i}>{errors[i]}</div>)
		}
		return (
			<div>
				{loading && (
					<Spinner
						color='primary'
						style={{ width: '1rem', height: '1rem' }}
						type='grow'
					/>
				)}
				{!loading && (
					<div>
						<Card>
							<CardHeader>Products</CardHeader>
							<CardBody>
								{generatingVariants && (
									<Spinner
										color='primary'
										style={{
											width: '1rem',
											height: '1rem'
										}}
										type='grow'
									/>
								)}
								{!generatingVariants && (
									<Button
										color='primary'
										onClick={this.generateVariants}
									>
										Generate Variants
									</Button>
								)}
							</CardBody>
						</Card>
						<Card>
							<CardHeader>Products Info CSV</CardHeader>
							<CardBody>
								<Row>
									<Col>
										{preparingProductInfoCSV && (
											<Spinner
												color='primary'
												style={{
													width: '1rem',
													height: '1rem'
												}}
												type='grow'
											/>
										)}
										{!preparingProductInfoCSV && (
											<Button
												color='primary'
												onClick={
													this.prepareProductInfoCSV
												}
											>
												Generate Product Info CSV
											</Button>
										)}
									</Col>
									<Col>
										{productInfoCSVData.length > 0 ? (
											<CSVLink
												data={productInfoCSVData}
												filename='product_info.csv'
												style={{
													marginLeft: 5
												}}
											>
												<i className='fa fa-download' />
											</CSVLink>
										) : null}
									</Col>
								</Row>
							</CardBody>
						</Card>
						<Card>
							<CardHeader>Product Pricing</CardHeader>
							<CardBody>
								<Row>
									<Col>
										{preparingProductPriceCSV && (
											<Spinner
												color='primary'
												style={{
													width: '1rem',
													height: '1rem'
												}}
												type='grow'
											/>
										)}
										{!preparingProductPriceCSV && (
											<Button
												color='primary'
												onClick={
													this.prepareProductPriceCSV
												}
											>
												Generate Product Price CSV
											</Button>
										)}
									</Col>
									<Col>
										{productPriceCSVData.length > 0 ? (
											<CSVLink
												data={productPriceCSVData}
												filename='product_price_info.csv'
												style={{
													marginLeft: 5
												}}
											>
												<i className='fa fa-download' />
											</CSVLink>
										) : null}
									</Col>
								</Row>
								<Row style={{ marginTop: '20px' }}>
									<InputGroup>
										<InputGroupAddon addonType='prepend'>
											<InputGroupText>
												Choose CSV file
											</InputGroupText>
										</InputGroupAddon>
										<CSVReader
											cssClass='csv-reader-input'
											label=''
											onFileLoaded={
												this.handleFileSelection
											}
											onError={
												this.handleFileSelectionError
											}
											inputId='ObiWan'
											inputStyle={{}}
										/>
									</InputGroup>
									{totalCSVRows > 0 ? (
										<div>{errorTexts}</div>
									) : (
										<div></div>
									)}
									{errors.length === 0 &&
										validProducts.length > 0 && (
											<Button
												color='primary'
												onClick={
													this.updateProductsPrice
												}
											>
												Update Products price
											</Button>
										)}
								</Row>
							</CardBody>
						</Card>
					</div>
				)}
			</div>
		)
	}
}

export default withFirebase(ProductsHome)
