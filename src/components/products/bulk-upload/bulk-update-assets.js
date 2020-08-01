import React, { Component } from 'react'
import { withFirebase } from '../../../firebase'
import { Card, CardBody, CardHeader } from 'reactstrap'
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
import { Form, FormGroup, Input, Label, Button } from 'reactstrap'

class BulkUpdateAssets extends Component {
	constructor (props) {
		super(props)

		this.state = {
			productAssets: [],
			fetchingProducts: false,
			csvProducts: []
		}
	}

	fetchProducts = async () => {
		this.setState({ fetchingProducts: true })
		let csvProducts = this.state.csvProducts
		for (let i = 0; i < csvProducts.length; i++) {
			const csvproduct = csvProducts[i]
			const slug = csvproduct.slug
			let snapshot = await this.props.firebase.productWithSlug(slug).get()
			if (!snapshot.empty) {
				snapshot = snapshot.docs
				snapshot = snapshot[0]
				const pid = snapshot.id
				const product = snapshot.data()
				csvProducts[i] = {
					...csvProducts[i],
					product: product,
					pid: pid
				}
			} else {
				csvProducts[i] = {
					...csvProducts[i],
					error: 'Product with slug not found'
				}
			}
		}
		this.setState({ fetchingProducts: false, csvProducts })
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
					reject(error)
				},
				() => {
					const metadata = uploadTask.snapshot.metadata
					console.log(metadata)
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

	updateAssetForProducts = async () => {
		let { csvProducts } = this.state

		for (let i = 0; i < csvProducts.length; i++) {
			csvProducts[i]['queued'] = true
		}

		this.setState({ csvProducts })

		for (let i = 0; i < csvProducts.length; i++) {
			await this.updateAssetForProduct(i)
		}
	}

	updateAssetForProduct = async i => {
		let { csvProducts } = this.state
		const csvProduct = csvProducts[i]

		let { product, newAssets, slug, pid, updating } = csvProduct

		csvProducts[i]['updating'] = true
		csvProducts[i]['queued'] = false
		this.setState({ csvProducts })

		if (!updating) {
			let assets = {}

			try {
				for (let j = 0; j < newAssets.length; j++) {
					let asset = newAssets[j]
					console.log(asset)
					let newAsset = await this.uploadTaskPromise(
						slug,
						asset,
						this.props.firebase
					)
					console.log('New Asset' + newAsset)
					assets[asset.name] = newAsset
				}
				console.log('New Assets ' + assets)
				product['assets'] = assets

				await this.props.firebase.product(pid).set(product)
				csvProducts[i].product['assets'] = assets
			} catch (e) {
				console.error('error here' + JSON.stringify(e))
				csvProducts[i]['error'] = e
			}
		}
		csvProducts[i]['updating'] = false
		this.setState({ csvProducts })
	}

	onAssetsFolderChanged = event => {
		let assetFiles = event.target.files
		assetFiles = Array.from(assetFiles)

		let { csvProducts } = this.state

		for (let i = 0; i < csvProducts.length; i++) {
			const csvProduct = csvProducts[i]

			const slug = csvProduct.slug

			let productNewAssets = assetFiles.filter(
				asset => asset.name.substring(0, slug.length) === slug
			)

			if (productNewAssets.length > 0) {
				csvProducts[i]['newAssets'] = productNewAssets
			}

			csvProducts[i]['newAssetsUrls'] = []

			productNewAssets.forEach(file => {
				csvProducts[i]['newAssetsUrls'].push(URL.createObjectURL(file))
			})
		}

		this.setState({ csvProducts })
	}

	handleFileSelection = async csvdata => {
		let csvProducts = []
		for (let i in csvdata) {
			let row = csvdata[i]
			if (row.length === 1 && row[0] !== '') {
				csvProducts.push({ slug: row[0], updating: false })
			}
		}
		console.log('total slugs : ', csvProducts.length)
		this.setState({ csvProducts })
		this.fetchProducts()
	}

	getSummmary = () => {
		const { csvProducts } = this.state
		let csvProductRows = []
		let totalOldAssets = 0
		let totalNewAssets = 0

		let updatingAny = false
		for (let i = 0; i < csvProducts.length; i++) {
			updatingAny =
				updatingAny ||
				csvProducts[i]['updating'] === true ||
				csvProducts[i]['queued'] === true
		}
		csvProducts.forEach((csvProduct, index) => {
			const {
				product,
				slug,
				newAssets,
				pid,
				newAssetsUrls,
				updating,
				queued
			} = csvProduct
			if (product) {
				const oldAssetsCount = Object.keys(product.assets).length
				const newAssetsCount = newAssets ? newAssets.length : 0
				totalOldAssets += oldAssetsCount
				totalNewAssets += newAssetsCount
				csvProductRows.push(
					<ListGroupItem key={index}>
						<ListGroupItemHeading>
							<a
								target='_blank'
								href={'https://www.underk.in/p/' + slug}
							>
								{index + 1 + '.  ' + product.title + '  '}
							</a>

							{newAssetsCount > 0 && !updating && !updatingAny && (
								<Button
									color='primary'
									onClick={() =>
										this.updateAssetForProduct(index)
									}
								>
									Update Assets
								</Button>
							)}
							{newAssetsCount > 0 && queued && (
								<div
									className='animated fadeIn pt-3 text-center'
									style={{ marginLeft: '100px' }}
								>
									Queued...
								</div>
							)}
							{newAssetsCount > 0 && updating && (
								<div
									className='animated fadeIn pt-3 text-center'
									style={{ marginLeft: '100px' }}
								>
									Updating Assets...
								</div>
							)}
						</ListGroupItemHeading>
						<Container>
							<Row>Old Assets : {oldAssetsCount}</Row>
							<div
								style={{
									whiteSpace: 'nowrap',
									overflowX: 'scroll',
									overFlowY: 'hidden'
								}}
							>
								{Object.keys(product.assets).map(asset => (
									<img
										style={{
											display: 'inline-block',
											width: '50px'
										}}
										src={
											product.assets[asset]['downloadURL']
										}
									/>
								))}
							</div>
							<Row>New Assets : {newAssetsCount}</Row>
							{newAssetsUrls && (
								<div
									style={{
										whiteSpace: 'nowrap',
										overflowX: 'scroll',
										overFlowY: 'hidden'
									}}
								>
									{newAssetsUrls.map(asset => (
										<img
											style={{
												display: 'inline-block',
												width: '50px'
											}}
											src={asset}
										/>
									))}
								</div>
							)}
						</Container>
					</ListGroupItem>
				)
			}
		})

		return <Container>{<ListGroup>{csvProductRows}</ListGroup>}</Container>
	}

	render () {
		const { csvProducts, fetchingProducts } = this.state
		let updatingAny = false
		for (let i = 0; i < csvProducts.length; i++) {
			updatingAny =
				updatingAny ||
				csvProducts[i]['updating'] === true ||
				csvProducts[i]['queued'] === true
		}
		return (
			<Card>
				<CardHeader>Bulk Update Assets</CardHeader>
				<CardBody>
					{fetchingProducts && (
						<div className='animated fadeIn pt-3 text-center'>
							Fetching Products...
						</div>
					)}
					{!fetchingProducts && (
						<Form>
							<InputGroup>
								<InputGroupAddon addonType='prepend'>
									<InputGroupText>
										Choose CSV file
									</InputGroupText>
								</InputGroupAddon>
								<CSVReader
									cssClass='csv-reader-input'
									label=''
									onFileLoaded={this.handleFileSelection}
									inputId='ObiWan'
									inputStyle={{}}
								/>
							</InputGroup>
							{csvProducts.length > 0 && (
								<InputGroup style={{ marginTop: '20px' }}>
									<InputGroupAddon addonType='prepend'>
										<InputGroupText>
											Choose Assets file
										</InputGroupText>
									</InputGroupAddon>
									<Input
										label='Choose Assets Folder'
										directory=''
										webkitdirectory=''
										type='file'
										onChange={this.onAssetsFolderChanged}
									/>
								</InputGroup>
							)}
						</Form>
					)}
					{!fetchingProducts && (
						<div
							style={{
								marginTop: '20px',
								fontSize: '16px',
								fontWeight: 'bolder'
							}}
						>
							<Row style={{ marginBottom: '30px' }}>
								<Col>
									<Label>
										Total Slugs in CSV :{' '}
										{csvProducts.length}
									</Label>
								</Col>
								<Col>
									{csvProducts.length > 0 && !updatingAny && (
										<Button
											color='primary'
											onClick={() =>
												this.updateAssetForProducts()
											}
										>
											Update Assets
										</Button>
									)}
								</Col>
							</Row>

							{this.getSummmary()}
						</div>
					)}
				</CardBody>
			</Card>
		)
	}
}

export default withFirebase(BulkUpdateAssets)
