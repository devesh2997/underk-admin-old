import React, { Component } from 'react'
import { withFirebase } from '../../../firebase'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { Form, FormGroup, Input, Label, Button } from 'reactstrap'
import CSVReader from 'react-csv-reader'
import { generateSKU, isEmpty, prepareAttributeFilter } from '../../../utils'


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

class BulkUpload extends Component {
	constructor (props) {
		super(props)

		this.state = {
			categories: [],
			suppliers: [],
			collectionsAll: [],
			loadingCategories: false,
			loadingSuppliers: false,
			loadingCollections: false,
			loadingTypes: false,
			loadingAttributes: false,
			colors: [],
			styles: [],
			designs: [],
			sizes: [],
			types: {},
			attributesAll: {},
			totalCSVRows: 0,
			totalProductsWithAssets: 0,
			validProducts: [],
			assetFiles: [],
			errors: [],
			numOfCreatedProducts: 0,
			numOfUpdatedProducts: 0,
			numOfAssetsUploaded: 0,
			totalAssets: 0,
			isUploadingAssets: false,
			isUploadingProducts: false,
			successfullyUploadedAllAssets: false
		}
	}

	componentWillUnmount () {
		this.getCategories()
		this.getCollections()
		this.getSuppliers()
	}

	componentDidMount () {
		this.setState({
			loadingCategories: true,
			loadingSuppliers: true,
			loadingCollections: true,
			loadingTypes: true,
			loadingAttributes: true
		})

		this.getCategories = this.props.firebase
			.categories()
			.onSnapshot(snapshot => {
				let categories = []

				snapshot.forEach(doc =>
					categories.push({ ...doc.data(), cid: doc.data().slug })
				)

				this.setState({
					categories,
					loadingCategories: false
				})
			})

		this.getCollections = this.props.firebase
			.collections()
			.onSnapshot(snapshot => {
				let collectionsAll = []

				snapshot.forEach(doc =>
					collectionsAll.push({ ...doc.data(), id: doc.id })
				)

				this.setState({
					collectionsAll,
					loadingCollections: false
				})
			})

		this.getSuppliers = this.props.firebase
			.suppliers()
			.onSnapshot(snapshot => {
				let suppliers = []

				snapshot.forEach(doc =>
					suppliers.push({ ...doc.data(), sid: doc.id })
				)

				this.setState({
					suppliers,
					loadingSuppliers: false
				})
			})

		this.getTypes = this.props.firebase
			.typesSubtypes()
			.onSnapshot(snapshot => {
				let types = {}
				snapshot.forEach(
					doc => (types[doc.data().sku] = { ...doc.data() })
				)

				this.setState({ types, loadingTypes: false })
			})

		this.getAttributes = this.props.firebase
			.attributesAll()
			.onSnapshot(snapshot => {
				let attributesAll = {}
				snapshot.forEach(
					doc => (attributesAll[doc.data().type] = { ...doc.data() })
				)

				this.setState({ attributesAll, loadingAttributes: false })
			})
	}

	uploadTaskPromise = async (product_slug, file, firebase) => {
		return new Promise(function (resolve, reject) {
			let storageRef = firebase.productAssetsRef().child(product_slug)
			let uploadTask = storageRef.child(file.name).put(file)
			uploadTask.on(
				'state_changed',
				snapshot => {},
				error => {
					console.log(error)
					reject()
				},
				() => {
					const metadata = uploadTask.snapshot.metadata
					const {
						name,
						contentType,
						fullPath,
						size,
						bucket
					} = metadata
					uploadTask.snapshot.ref
						.getDownloadURL()
						.then(downloadURL => {
							let newAsset = {
								name,
								contentType,
								fullPath,
								size,
								bucket,
								downloadURL
							}
							resolve(newAsset)
						})
				}
			)
		})
	}

	onAssetsFolderChanged = event => {
		let assetFiles = event.target.files
		assetFiles = Array.from(assetFiles)
		let { validProducts } = this.state
		let totalProductsWithAssets = 0
		let totalAssets = 0

		for (let i = 0; i < validProducts.length; i++) {
			let product = validProducts[i].product

			const slug = product.slug

			let productAssets = assetFiles.filter(
				asset => asset.name.substring(0, slug.length) === slug
			)
			// console.log(productAssets)

			if (productAssets.length > 0) {
				totalAssets += productAssets.length
				validProducts[i].product['assets'] = productAssets
				totalProductsWithAssets++
			}
			// console.log(productAssets)
		}

		// console.log(validProducts)
		this.setState({
			assetFiles,
			validProducts,
			totalProductsWithAssets,
			totalAssets
		})
	}

	handleFileSelection = async csvdata => {
		let totalCSVRows = 0
		let validProducts = []
		let errors = []

		const {
			categories,
			suppliers,
			collectionsAll,
			types,
			attributesAll
		} = this.state
		console.log('aa', attributesAll)
		// console.log(types, attributesAll)
		for (let i in csvdata) {
			if (Number(i) !== csvdata.length) totalCSVRows++
			let row = csvdata[i]
			if (row.length === 17) {
				let product = {}
				try {
					let type = row[0]
					let subtype = row[1]
					let title = row[2]
					let slug = row[3]
					let isActive = row[4] === 'TRUE'
					let gender = row[5]
					let category = row[6]
					let collections = JSON.parse(row[7])
					let listPrice = Number(row[8])
					let discount = Number(row[9])
					let taxPercent = Number(row[10])
					let isInclusiveTax = row[11] === 'TRUE'
					let attributes = JSON.parse(row[12])
					let options = JSON.parse(row[13])
					let description = JSON.parse(row[14])
					let keywords = JSON.parse(row[15])
					let optionHelp = row[16]

					if (
						title &&
						description &&
						slug &&
						isActive !== undefined &&
						gender &&
						category &&
						listPrice !== undefined &&
						discount &&
						taxPercent !== undefined &&
						isInclusiveTax !== undefined &&
						type &&
						subtype
					) {
						if (isNaN(listPrice)) {
							throw 'Invalid list price given at row '
						}
						if (isNaN(taxPercent)) {
							throw 'Invalid tax Percent given at row '
						}
						if (isNaN(discount)) {
							if (discount[discount.length - 1] !== '%') {
								throw 'Invalid discount value'
							}
							const d = discount.substring(0, discount.length)
							if (isNaN(d)) {
								throw 'Invalid discount value'
							}
						}
						if (!isNaN(discount)) {
							if (discount > listPrice) {
								throw 'Discount is greater than listPrice'
							}
						}
						if (
							gender !== 'M' &&
							gender !== 'F' &&
							gender !== 'U'
						) {
							throw 'Invalid gender at row '
						}

						if (
							isEmpty(types[type]) ||
							isEmpty(attributesAll[type])
						) {
							throw 'Invalid type'
						}

						if (
							isEmpty(types[type]['subtypes'][subtype]) ||
							isEmpty(attributesAll[type]['subtypes'][subtype])
						) {
							throw 'Invalid subtype'
						}

						if (!types[type]) {
							throw 'Invalid type'
						}

						if (!types[type]['subtypes'][subtype]) {
							throw 'Invalid subtype'
						}

						category = categories.find(c => c.cid === category)
						delete category.extra
						if (!category) {
							throw 'Invalid category id provided'
						}
						for (let i = 0; i < collections.length; i++) {
							const _col = collectionsAll.find(
								c => c.slug === collections[i]
							)
							if (!_col) throw 'Invalid collection provided'
						}

						let rowAttributesAll =
							attributesAll[type]['subtypes'][subtype]
						let attributesTemp = {}
						let filters = []
						let skuOrdering
						filters.push(prepareAttributeFilter('type', type))
						filters.push(prepareAttributeFilter('subtype', subtype))
						if (types[type]['subtypes'][subtype]['skuOrdering']) {
							skuOrdering =
								types[type]['subtypes'][subtype]['skuOrdering']
							for (let j = 0; j < skuOrdering.length; j++) {
								let attributeName = skuOrdering[j]
								if (!attributes[attributeName]) {
									throw 'Required attribute : ' +
										attributeName +
										' missing'
								} else {
									let attributeValueId =
										attributes[attributeName]
									let filterable = !attributeValueId.includes(
										':nf'
									)
									if (!filterable) {
										attributeValueId = attributeValueId.split(
											':'
										)[0]
									}
									attributesTemp[attributeName] =
										rowAttributesAll[attributeName][
											attributeValueId
										]
									attributesTemp[attributeName][
										'filterable'
									] = filterable
									if (filterable) {
										filters.push(
											prepareAttributeFilter(
												attributeName,
												attributeValueId
											)
										)
									}
								}
							}
						}

						let attributeNames = Object.keys(attributes)
						for (let j = 0; j < attributeNames.length; j++) {
							if (isEmpty(attributesTemp[attributeNames[j]])) {
								let attributeValueId =
									attributes[attributeNames[j]]
								let filterable = !attributeValueId.includes(
									':nf'
								)
								if (
									isEmpty(rowAttributesAll[attributeNames[j]])
								) {
									throw 'Invalid attribute name'
								} else {
									if (
										isEmpty(
											rowAttributesAll[attributeNames[j]][
												attributeValueId
											]
										)
									) {
										throw 'invalid attribute value for attribute: ' +
											attributeNames[j]
									} else {
										attributesTemp[attributeNames[j]] =
											rowAttributesAll[attributeNames[j]][
												attributeValueId
											]
										attributesTemp[attributeNames[j]][
											'filterable'
										] = filterable
										if (filterable) {
											filters.push(
												prepareAttributeFilter(
													attributeNames[j],
													attributeValueId
												)
											)
										}
									}
								}
							}
						}

						attributes = attributesTemp
						// console.log(attributes)

						let sizeValues = {}
						console.log('oo', options)

						if (!isEmpty(options)) {
							if (!options['inventory'])
								throw 'Inventory not provided'
							if (!options['type'])
								throw 'Inventory type not provided'
							if (
								options['type'] !== 'single' &&
								options['type'] !== 'multiple'
							)
								throw 'Invalid inventory type provided'
							if (
								options['type'] === 'multiple' &&
								isEmpty(options['based_on'])
							)
								throw 'Based on attribute missing'
							let productSuppliers = Object.keys(
								options['inventory']
							)
							if (productSuppliers.length < 1)
								throw 'No supplier info provided'
							console.log(suppliers)
							productSuppliers.map((sid, index) => {
								let bareSID = sid.split(':')[0]
								let found = suppliers.find(
									s => s.sid === bareSID
								)
								if (isEmpty(found))
									throw 'Invalid supplier id provided in inventory'
							})
							let basedOn = options['based_on']
							if (options['type'] === 'multiple') {
								if (isEmpty(basedOn))
									throw 'Based on name not provided.'
								productSuppliers.map((sid, index) => {
									let productOptions = Object.keys(
										options['inventory'][sid]
									)
									for (
										let i = 0;
										i < productOptions.length;
										i++
									) {
										if (
											isEmpty(
												rowAttributesAll[basedOn][
													productOptions[i]
												]
											)
										)
											throw 'Invalid option provided for inventory'
										let optionInventory =
											options['inventory'][sid][
												productOptions[i]
											]
										let inventoryKeys = Object.keys(
											optionInventory
										)
										for (
											let j = 0;
											j < inventoryKeys.length;
											j++
										) {
											let key = inventoryKeys[j]
											if (
												key !== 'qty' &&
												key !== 'order' &&
												key !== 'cp'
											)
												throw 'Invalid inventory'
										}
										if (
											isEmpty(optionInventory['order']) ||
											isEmpty(optionInventory['qty']) ||
											isEmpty(optionInventory['cp'])
										)
											throw 'Invalid inventory'
										filters.push(
											prepareAttributeFilter(
												basedOn,
												productOptions[i]
											)
										)
									}
								})
							} else {
								productSuppliers.map((sid, index) => {
									let inventoryKeys = Object.keys(
										options['inventory'][sid]
									)
									for (
										let j = 0;
										j < inventoryKeys.length;
										j++
									) {
										let key = inventoryKeys[j]
										if (
											key !== 'qty' &&
											key !== 'order' &&
											key !== 'cp'
										)
											throw 'Invalid inventory'
									}
									if (
										isEmpty(
											options['inventory'][sid]['qty']
										) ||
										isEmpty(options['inventory'][sid]['cp'])
									)
										throw 'Invalid inventory'
								})
							}
						}
						console.log('here')
						const sellingPrice = Number(listPrice - discount)
						const createdAt = new Date().getTime()
						subtype = {
							sku: types[type]['subtypes'][subtype]['sku'],
							name: types[type]['subtypes'][subtype]['name']
						}
						type = {
							sku: type,
							name: types[type]['name']
						}

						console.log('here1')
						product = {
							type,
							subtype,
							title,
							description,
							slug,
							isActive,
							gender,
							category,
							listPrice,
							sellingPrice,
							discount,
							taxPercent,
							isInclusiveTax,
							type,
							collections,
							options,
							attributes,
							keywords,
							filters,
							createdAt
						}

						let pr = validProducts.find(p => p.slug == product.slug)
						if (pr !== undefined) {
							throw 'Slug matches with another product in the sheet. Other product title : ' +
								pr.title
						}

						let productAndInventoryObject = {}
						productAndInventoryObject = generateSKU(
							product,
							skuOrdering,
							suppliers,
							rowAttributesAll
						)
						if (
							productAndInventoryObject.product === null ||
							productAndInventoryObject.product === undefined
						) {
							throw 'Product object not returned when generating SKU.'
						}
						if (
							productAndInventoryObject.inventory === null ||
							productAndInventoryObject.inventory === undefined
						) {
							throw 'Inventory object not returned when generating SKU.'
						}
						let product = productAndInventoryObject.product

						Object.keys(product.options.skus).forEach(sku => {
							for (let i = 0; i < validProducts.length; i++) {
								Object.keys(
									validProducts[i].product.options.skus
								).forEach(s => {
									if (s === sku) {
										throw 'SKU matches with another product in the sheet, Other product title : ' +
											validProducts[i].product.title
									}
								})
							}
						})

						//add options help
						if (!isEmpty(optionHelp)) {
							productAndInventoryObject.product.options[
								'option_help'
							] = optionHelp
						}
						console.log(productAndInventoryObject)
						validProducts.push(productAndInventoryObject)
					} else {
						throw 'All the fields are not filled or invalid type is given at row '
					}
				} catch (error) {
					let errorrow = Number(i) + 1
					errors.push('Row : ' + errorrow + ', Error : ' + error)
					console.log('Row : ', errorrow, ', Error : ', error)
				}
			} else {
				if (Number(i) !== csvdata.length - 1) {
					let errorrow = Number(i) + 1
					console.log('Invalid number of columns at row ' + errorrow)
					errors.push(
						'Row ' + errorrow + ' : Invalid number of columns.'
					)
				}
			}
		}
		console.log('total rows : ', totalCSVRows)
		console.log('valid products : ', validProducts.length)
		this.setState({ totalCSVRows, validProducts, errors })
	}

	getForm = () => {
		let loading = false

		const {
			validProducts,
			totalCSVRows,
			errors,
			totalProductsWithAssets,
			isUploadingAssets,
			numOfAssetsUploaded,
			assetFiles,
			successfullyUploadedAllAssets,
			isUploadingProducts,
			numOfCreatedProducts,
			numOfUpdatedProducts
		} = this.state

		let errorTexts = []
		for (let i = 0; i < errors.length; i++) {
			errorTexts.push(<div key={i}>{errors[i]}</div>)
		}

		return (
			<Form>
				{loading ? (
					<div className='animated fadeIn pt-3 text-center'>
						Loading...
					</div>
				) : (
					<div>
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
							<div>
								{errorTexts}
								{/* totalCSVRows === validProducts.length */}
								{true ? (
									<div style={{ marginTop: 20 }}>
										<InputGroup>
											<InputGroupAddon addonType='prepend'>
												<InputGroupText>
													Choose Assets Folder
												</InputGroupText>
											</InputGroupAddon>
											<Label></Label>
											<Input
												label='Choose Assets Folder'
												directory=''
												webkitdirectory=''
												type='file'
												onChange={
													this.onAssetsFolderChanged
												}
											/>
										</InputGroup>
										{totalProductsWithAssets ===
										validProducts.length ? (
											<div>
												<Label>
													Total assets uploaded :{' '}
													{numOfAssetsUploaded} of{' '}
													{assetFiles.length}
												</Label>
												{!successfullyUploadedAllAssets ? (
													!isUploadingAssets ? (
														<div></div>
													) : (
														<div>
															Uploading Assets ...
														</div>
													)
												) : (
													<div>
														<Label>
															Total Products
															Created :{' '}
															{
																numOfCreatedProducts
															}
														</Label>
														<br />
														<Label>
															Total Products
															Updated :{' '}
															{
																numOfUpdatedProducts
															}
														</Label>
														<br />
														{!isUploadingProducts ? (
															<Button
																onClick={
																	this
																		.uploadProducts
																}
																color={
																	'primary'
																}
															>
																Upload Product
																Data
																#Good_Job_creating_csv_file_and_assets_folder
															</Button>
														) : (
															<div>
																Uploading
																Products ...
															</div>
														)}
													</div>
												)}
											</div>
										) : (
											<div />
										)}
									</div>
								) : (
									<div />
								)}
							</div>
						) : (
							<div />
						)}
					</div>
				)}
			</Form>
		)
	}

	uploadNewProduct = async i => {
		console.log('uploading product init')
		let { validProducts, errors } = this.state
		validProducts[i]['uploading'] = true
		this.setState({ validProducts })
		let product = validProducts[i].product
		let synced = validProducts[i].synced
		let syncing = validProducts[i].syncing
		if (!syncing && synced) {
			let assets = {}
			for (let j = 0; j < product.assets.length; j++) {
				let asset = product.assets[j]
				let newAsset = await this.uploadTaskPromise(
					product.slug,
					asset,
					this.props.firebase
				)
				if (newAsset === undefined) {
					errors.push(
						'Error in uploading asset with name : ' + asset.name
					)
				} else {
					assets[asset.name] = newAsset
					this.setState({
						numOfAssetsUploaded: this.state.numOfAssetsUploaded + 1
					})
				}
			}
			product['assets'] = assets
			let inventory = validProducts[i].inventory
			let inventoryTransactions = validProducts[i].inventoryTransactions
			let prevProductRef = this.props.firebase
				.products()
				.where('slug', '==', product.slug)
			let productsRef = this.props.firebase.products()
			let newProductRef = productsRef.doc()
			let inventoryRef = this.props.firebase.inventory()
			let inventoryTransactionsRef = this.props.firebase.inventoryTransactions()
			let prevProduct = await prevProductRef.get()
			if (prevProduct.empty) {
				let batch = this.props.firebase.db.batch()
				batch.set(newProductRef, product)
				batch.set(inventoryRef.doc(newProductRef.id), inventory)
				for (let j = 0; j < inventoryTransactions.length; j++) {
					inventoryTransactions[j].pid = newProductRef.id
					batch.set(
						inventoryTransactionsRef.doc(),
						inventoryTransactions[j]
					)
				}
				try {
					await batch.commit()
					console.log('Uploaded product with id' + newProductRef.id)
					validProducts[i]['queued'] = false
					validProducts[i]['uploading'] = false
					this.setState({
						numOfCreatedProducts:
							this.state.numOfCreatedProducts + 1,
						validProducts
					})
				} catch (e) {
					validProducts[i]['error'] = e
					this.setState({ validProducts })
					console.error(e)
				}
			}
			// validProducts[i].product = product
			// console.log(validProducts[i])
		}
	}

	uploadNewProducts = async () => {
		let { validProducts, errors } = this.state
		this.setState({ uploading: true })
		for (let i = 0; i < validProducts.length; i++) {
			if (validProducts[i]['indb']) continue
			validProducts[i]['queued'] = true
			this.setState({ validProducts })
		}
		for (let i = 0; i < validProducts.length; i++) {
			if (validProducts[i]['indb']) continue

			await this.uploadNewProduct(i)
		}
		this.setState({ uploading: false })
	}

	sync = async () => {
		let { validProducts } = this.state
		this.setState({ synced: true, syncing: true })
		let numOfNewProducts = 0
		let numOfPrevProducts = 0
		const results = validProducts.map(async (product, index) => {
			validProducts[index]['syncing'] = true
			this.setState({ validProducts })
			const p = product.product
			const i = product.inventory
			let prevProductRef = this.props.firebase
				.products()
				.where('slug', '==', p.slug)
			prevProductRef.onSnapshot(snapshot => {
				validProducts[index]['synced'] = true
				validProducts[index]['syncing'] = false
				if (!snapshot.empty) {
					validProducts[index]['indb'] = snapshot.docs[0]
					numOfPrevProducts++
				} else {
					numOfNewProducts++
				}
				this.setState({
					validProducts,
					numOfPrevProducts,
					numOfNewProducts
				})
				if (
					validProducts.length ===
					numOfNewProducts + numOfPrevProducts
				) {
					this.setState({ syncing: false })
				}
			})
		})
	}

	getSummary = () => {
		const {
			synced,
			syncing,
			uploading,
			validProducts,
			totalCSVRows,
			totalProductsWithAssets,
			totalAssets,
			numOfCreatedProducts,
			numOfUpdatedProducts,
			numOfPrevProducts,
			numOfNewProducts
		} = this.state
		if (totalCSVRows === 0) return <div />
		let categories = {}
		validProducts.map((product, index) => {
			const p = product.product
			const i = product.inventory
			const syncing = product.syncing
			const synced = product.synced
			const indb = product.indb
			const uploading = product.uploading
			const queued = product.queued
			if (!categories[p.category.slug]) {
				categories[p.category.slug] = []
			}
			categories[p.category.slug].push(
				<ListGroupItem key={index}>
					<ListGroupItemHeading>
						{index + 1 + '.  ' + p.title + '  '}
						{syncing && (
							<Spinner
								color='primary'
								style={{ width: '1rem', height: '1rem' }}
								type='grow'
							/>
						)}
						{uploading && (
							<span>
								<Spinner
									color='success'
									style={{ width: '1rem', height: '1rem' }}
									type='grow'
								/>
								{'   uploading...'}
							</span>
						)}
						{queued && !uploading && (
							<span>
								<Spinner
									color='warning'
									style={{ width: '1rem', height: '1rem' }}
									type='grow'
								/>
								{'   queued...'}
							</span>
						)}
					</ListGroupItemHeading>
					<Container>
						{p.attributes.color && (
							<Row>
								<Col
									style={{
										color: p.attributes.color.hexcode
									}}
								>
									{p.attributes.color.name}
								</Col>
								<Col>
									Inventory -{' '}
									{Object.keys(i).map((sku, index) => {
										if (sku === 'skus')
											return <span key={index}></span>
										let stock = 0
										const inventoryKeys = Object.keys(
											i[sku]['inventory']
										)
										for (
											let j = 0;
											j < inventoryKeys.length;
											j++
										) {
											stock +=
												i[sku]['inventory'][
													inventoryKeys[j]
												]['stock']
										}
										return (
											<span key={index}>
												{i[sku]['name'] +
													' : ' +
													stock +
													' | ' +
													i[sku]['reserved'] +
													',  '}
											</span>
										)
									})}
								</Col>
								{!uploading &&
									!queued &&
									!syncing &&
									synced &&
									p.assets &&
									p.assets.length > 0 && (
										<Col sm='1'>
											<Button
												color={'primary'}
												onClick={() =>
													this.uploadNewProduct(index)
												}
											>
												Upload
											</Button>
										</Col>
									)}
							</Row>
						)}
						{p.assets && (
							<Row>
								<Col>
									<Label>Assets </Label>
									<Badge pill>{p.assets.length}</Badge>
								</Col>
								<Col />
							</Row>
						)}
						{synced && (
							<Row>
								{indb && <Col>Indb</Col>}
								{!indb && (
									<Col>
										<Badge color='success'>New</Badge>
									</Col>
								)}
							</Row>
						)}
					</Container>
				</ListGroupItem>
			)
		})
		return (
			<Container>
				<Row>
					<Col>Total Number of Rows in CSV : </Col>
					<Col>{totalCSVRows}</Col>
				</Row>
				<Row>
					<Col>Total Valid Products : </Col>
					<Col>{validProducts.length}</Col>
				</Row>
				<Row>
					<Col>Total Products for which assets were found : </Col>
					<Col>{totalProductsWithAssets}</Col>
				</Row>
				<Row>
					<Col>Total Assets : </Col>
					<Col>{totalAssets}</Col>
				</Row>
				{synced && (
					<div>
						<Row>
							<Col>Number of New Products : </Col>
							<Col>{numOfNewProducts}</Col>
						</Row>
						<Row>
							<Col>Number of Old Products : </Col>
							<Col>{numOfPrevProducts}</Col>
						</Row>
						<Row>
							<Col>Number of Created Products : </Col>
							<Col>{numOfCreatedProducts}</Col>
						</Row>
						<Row>
							<Col>Number of Updated Products : </Col>
							<Col>{numOfUpdatedProducts}</Col>
						</Row>
					</div>
				)}
				<br />
				<Row>
					<Col>
						<h3>Valid Products:</h3>
					</Col>
					{!uploading && (
						<Row>
							<Col>
								{!syncing ? (
									<Button
										outline
										color='primary'
										onClick={this.sync}
									>
										Sync
									</Button>
								) : (
									<Spinner
										color='primary'
										style={{
											width: '2rem',
											height: '2rem'
										}}
										type='grow'
									/>
								)}
							</Col>
							{!syncing &&
								synced &&
								totalProductsWithAssets > 0 &&
								numOfNewProducts > 0 && (
									<Col>
										<Button
											outline
											color='primary'
											onClick={this.uploadNewProducts}
										>
											Upload New Products
										</Button>
									</Col>
								)}
							{!syncing &&
								synced &&
								totalProductsWithAssets > 0 &&
								numOfPrevProducts > 0 && (
									<Col>
										<Button
											outline
											color='primary'
											onClick={this.sync}
										>
											Update Old Products
										</Button>
									</Col>
								)}
						</Row>
					)}
					{uploading && (
						<Col>
							<Spinner
								color='primary'
								style={{ width: '2rem', height: '2rem' }}
								type='grow'
							/>
						</Col>
					)}
				</Row>
				<br />
				<ListGroup>
					{Object.keys(categories).map((slug, index) => {
						return (
							<ListGroup key={slug}>
								<ListGroupItemHeading>
									{index + 1 + ') ' + slug + '    '}
									<Badge pill>
										{categories[slug].length}
									</Badge>
								</ListGroupItemHeading>
								{categories[slug]}
								<br />
							</ListGroup>
						)
					})}
				</ListGroup>
			</Container>
		)
	}
	render () {
		const {
			loadingCategories,
			loadingSuppliers,
			loadingCollections,
			loadingTypes,
			loadingAttributes
		} = this.state
		return (
			<div>
				<Card>
					<CardHeader>Bulk Upload</CardHeader>
					<CardBody>
						{loadingCategories ||
						loadingSuppliers ||
						loadingCollections ||
						loadingTypes ||
						loadingAttributes ? (
							<div className='animated fadeIn pt-3 text-center'>
								Loading...
							</div>
						) : (
							this.getForm()
						)}
					</CardBody>
				</Card>
				{loadingCategories || loadingSuppliers || loadingCollections ? (
					<div />
				) : (
					<Card>
						<CardHeader>Summary</CardHeader>
						<CardBody>{this.getSummary()}</CardBody>
					</Card>
				)}
			</div>
		)
	}
}

export default withFirebase(BulkUpload)
