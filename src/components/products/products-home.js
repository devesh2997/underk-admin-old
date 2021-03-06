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
	InputGroupText,
	Input
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
			preparingProductDescriptionCSV: false,
			category_id: 'all',
			loadingCategories: false,
			categories: [],
			productPriceCSVData: [],
			productInfoCSVData: [],
			productDescriptionCSVData: [],
			loading: false,
			products: [],
			errors: [],
			validProducts: []
		}
	}

	componentDidMount () {
		this.setState({ loadingCategories: true })

		this.props.firebase
			.categories()
			.get()
			.then(snapshot => {
				let categories = []
				snapshot.forEach(doc =>
					categories.push({ ...doc.data(), cid: doc.id })
				)
				this.setState({ categories, loadingCategories: false })
			})
	}

	getProductWithCategory = async () => {
		this.setState({ loading: true })
		const { category_id } = this.state

		let snapshots = await this.props.firebase
			.productsWithCategory(category_id)
			.get()
		snapshots = snapshots.docs
		let products = []
		snapshots.forEach(snapshot =>
			products.push({ ...snapshot.data(), pid: snapshot.id })
		)

		this.setState({ loading: false })

		return products
	}

	updateProductsDescription = async () => {
		this.setState({ loading: true })
		const { validDescriptionProducts } = this.state

		for (let i = 0; i < validDescriptionProducts.length; i++) {
			const validDescriptionProduct = validDescriptionProducts[i]
			await this.props.firebase.product(validDescriptionProduct.pid).set(
				{
					slug: validDescriptionProduct.slug,
					title: validDescriptionProduct.title,
					description: validDescriptionProduct.description
				},
				{ merge: true }
			)
		}

		this.setState({ loading: false })
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

	handleDescriptionFileSelection = async csvdata => {
		let totalDescriptionCSVRows = 0
		let validDescriptionProducts = []
		let descriptionErrors = []

		let products = await this.getProductWithCategory(this.state.category_id)

		const titles = csvdata[0]

		const descriptionHeadings = []

		for (let i = 3; i < titles.length; i++) {
			if (!isEmpty(titles[i])) descriptionHeadings.push(titles[i])
		}

		for (let i in csvdata) {
			let row = csvdata[i]
			if (row[0] === 'pid') continue
			if (isEmpty(row[0]) || isEmpty(row[1]) || isEmpty(row[2])) continue

			totalDescriptionCSVRows++

			try {
				let pid = row[0]
				const product = products.find(p => p.pid === pid)
				if (typeof product === 'undefined') {
					throw 'Product with pid ' + pid + ' not found'
				}

				const slug = row[1]
				const title = row[2]

				let description = []

				for (let i = 0; i < descriptionHeadings.length; i++) {
					const column = 3 + i
					let desc = {}

					const value = row[column]

					const values = value.split(',')
					desc[descriptionHeadings[i]] = values

					description.push(desc)
				}

				validDescriptionProducts.push({ pid, slug, title, description })
			} catch (error) {
				let errorrow = Number(i) + 1
				descriptionErrors.push(
					'Row : ' + errorrow + ', Error : ' + error
				)
				console.log('Row : ', errorrow, ', Error : ', error)
			}
		}

		console.log(validDescriptionProducts)

		this.setState({
			totalDescriptionCSVRows,
			validDescriptionProducts,
			descriptionErrors
		})
	}

	handleFileSelection = async csvdata => {
		let totalCSVRows = 0
		let validProducts = []
		let errors = []

		let products = await this.getProductWithCategory(this.state.category_id)

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

	prepareProductDescriptionCSV = async () => {
		this.setState({ preparingProductDescriptionCSV: true })

		let products = await this.getProductWithCategory(this.state.category_id)

		let csvData = products.map(product => {
			const pid = product.pid
			const title = product.title
			const slug = product.slug
			let desc = product.description
			let obj = { pid, slug, title }
			for (let i = 0; i < desc.length; i++) {
				const d = desc[i]
				const key = Object.keys(d)[0]
				obj[key] = d[key]
			}
			return obj
		})
		this.setState({
			preparingProductDescriptionCSV: false,
			productDescriptionCSVData: csvData
		})
	}

	prepareProductPriceCSV = async () => {
		this.setState({ preparingProductPriceCSV: true })
		let products = await this.getProductWithCategory(this.state.category_id)
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
		let products = await this.getProductWithCategory(this.state.category_id)
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

	_findVariantsCandidates = (
		product,
		products,
		skuOrdering,
		variantsBasis
	) => {
		const type = product.type.sku
		const subtype = product.subtype.sku
		const gender = product.gender
		const cid = product.category.cid

		let variants = products.filter(
			p =>
				p.type.sku === type &&
				p.gender === gender &&
				p.category.cid === cid &&
				p.subtype.sku === subtype
		)

		console.log(`variant candidates : ${variants.length}`)

		variants = variants.filter(p => {
			let flag = skuOrdering.length > 0
			for (let j = 0; j < skuOrdering.length; j++) {
				// console.log(skuOrdering[j])
				if (isEmpty(variantsBasis.find(v => v === skuOrdering[j]))) {
					flag =
						p.attributes[skuOrdering[j]].sku ===
						product.attributes[skuOrdering[j]].sku
				}
			}

			return flag
		})

		return variants
	}

	generateVariants = async () => {
		this.setState({ generatingVariants: true })
		let typesSnapshots = await this.props.firebase.typesSubtypes().get()
		let types = {}
		typesSnapshots.forEach(doc => (types[doc.id] = { ...doc.data() }))

		this.setState({ types, loadingTypes: false })
		let products = await this.props.firebase.products().get()
		products = products.docs
		for (let i = 0; i < products.length; i++) {
			const id = products[i].id
			products[i] = products[i].data()
			products[i]['pid'] = id
		}
		// console.log(products)
		for (let i = 0; i < products.length; i++) {
			let product = products[i]
			const type = product.type.sku
			const subtype = product.subtype.sku
			const skuOrdering = types[type].subtypes[subtype].skuOrdering
			const variantsBasis = types[type].subtypes[subtype].variantsBasis

			console.log(
				'generating for : ',
				product.title + ' : ' + product.category.name
			)
			let variants = this._findVariantsCandidates(
				product,
				products,
				skuOrdering,
				variantsBasis
			)
			for (let j = 0; j < variants.length; j++) {
				const variant = variants[j]
				await this.props.firebase.db
					.doc(`products/${product.pid}/variants/${variant.pid}`)
					.set({
						pid: variant.pid,
						type: 'color',
						value: variant.attributes.color,
						slug: variant.slug
					})
			}
		}
		this.setState({ generatingVariants: false })
	}

	onChange = event => {
		this.setState({ [event.target.name]: event.target.value })
	}

	render () {
		const {
			generatingVariants,
			preparingProductPriceCSV,
			preparingProductInfoCSV,
			preparingProductDescriptionCSV,
			productPriceCSVData,
			productInfoCSVData,
			productDescriptionCSVData,
			loading,
			loadingCategories,
			errors,
			totalCSVRows,
			totalDescriptionCSVRows,
			validDescriptionProducts,
			descriptionErrors,
			validProducts,
			categories,
			category_id
		} = this.state

		let errorTexts = []
		for (let i = 0; i < errors.length; i++) {
			errorTexts.push(<div key={i}>{errors[i]}</div>)
		}

		let descriptionErrorTexts = []
		if (descriptionErrors)
			for (let i = 0; i < descriptionErrors.length; i++) {
				errorTexts.push(<div key={i}>{descriptionErrors[i]}</div>)
			}
		return (
			<div>
				{(loading || loadingCategories) && (
					<Spinner
						color='primary'
						style={{ width: '1rem', height: '1rem' }}
						type='grow'
					/>
				)}
				{!(loading || loadingCategories) && (
					<Card>
						<CardHeader>Manage Catalogue</CardHeader>
						<CardBody>
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
											name='category_id'
											value={category_id}
											onChange={this.onChange}
										>
											<option value='all'>all</option>
											{categories.map(category => (
												<option
													key={category.cid}
													value={category.cid}
												>
													{category.name}
												</option>
											))}
										</Input>
									</InputGroup>
								</Col>
							</Row>
							<div style={{ marginTop: '20px' }}>
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
															this
																.prepareProductInfoCSV
														}
													>
														Generate Product Info
														CSV
													</Button>
												)}
											</Col>
											<Col>
												{productInfoCSVData.length >
												0 ? (
													<CSVLink
														data={
															productInfoCSVData
														}
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
									<CardHeader>
										Products Description CSV
									</CardHeader>
									<CardBody>
										<Row>
											<Col>
												{preparingProductDescriptionCSV && (
													<Spinner
														color='primary'
														style={{
															width: '1rem',
															height: '1rem'
														}}
														type='grow'
													/>
												)}
												{!preparingProductDescriptionCSV && (
													<Button
														color='primary'
														onClick={
															this
																.prepareProductDescriptionCSV
														}
													>
														Generate Product
														Description CSV
													</Button>
												)}
											</Col>
											<Col>
												{productDescriptionCSVData.length >
												0 ? (
													<CSVLink
														data={
															productDescriptionCSVData
														}
														filename='product_description.csv'
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
														this
															.handleDescriptionFileSelection
													}
													onError={
														this
															.handleFileSelectionError
													}
													inputId='ObiWan'
													inputStyle={{}}
												/>
											</InputGroup>
											{totalDescriptionCSVRows &&
											totalDescriptionCSVRows > 0 ? (
												<div>
													{descriptionErrorTexts}
												</div>
											) : (
												<div></div>
											)}
											{!descriptionErrors ||
												(descriptionErrors.length ===
													0 &&
													validDescriptionProducts.length >
														0 && (
														<Button
															color='primary'
															onClick={
																this
																	.updateProductsDescription
															}
														>
															Update Product
															Title, Slug and
															Description
														</Button>
													))}
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
															this
																.prepareProductPriceCSV
														}
													>
														Generate Product Price
														CSV
													</Button>
												)}
											</Col>
											<Col>
												{productPriceCSVData.length >
												0 ? (
													<CSVLink
														data={
															productPriceCSVData
														}
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
														this
															.handleFileSelectionError
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
															this
																.updateProductsPrice
														}
													>
														Update Products price
													</Button>
												)}
										</Row>
									</CardBody>
								</Card>
							</div>
						</CardBody>
					</Card>
				)}
			</div>
		)
	}
}

export default withFirebase(ProductsHome)
