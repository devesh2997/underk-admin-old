import React, { Component } from 'react'
import { withFirebase } from '../../../firebase'
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

class CollectionsBulkUpload extends Component {
	constructor (props) {
		super(props)

		this.state = {
			loading: false,
			collections: null,
			errors: [],
			validCollections: []
		}
	}

	addCollection = async (name, slug, collections) => {
		let found
		if (collections) found = collections.find(c => c.id === slug)
		if (!found) {
			let collection = { id: slug, name, slug }
			await this.props.firebase
				.collections()
				.doc(slug)
				.set(collection)
		} else {
			console.log('collection already exists')
		}
	}

	uploadCollections = async () => {
		this.setState({ loading: true })
		let { validCollections } = this.state
		for (let i = 0; i < validCollections.length; i++) {
			let collections = await this.getCollections()
			console.log(collections)
			let validCollection = validCollections[i]
			await this.addCollection(
				validCollection.name,
				validCollection.slug,
				collections
			)
		}
		this.setState({ loading: false })
	}

	getCollections = async () => {
		let snapshots = await this.props.firebase.collections().get()
		if (!snapshots.empty) {
			snapshots = snapshots.docs
			let collections = []

			snapshots.forEach(doc =>
				collections.push({ ...doc.data(), id: doc.id })
			)

			return collections
		} else {
			return null
		}
	}

	fetchCollections = async () => {
		this.setState({ loading: true })
		let collections = await this.getCollections()
		this.setState({ loading: false, collections })
	}

	componentDidMount () {
		// this.fetchCollections()
	}

	handleFileSelection = async csvdata => {
		let totalCSVRows = 0
		let validCollections = []
		let errors = []
		console.log(csvdata)
		for (let i in csvdata) {
			if (Number(i) !== csvdata.length) totalCSVRows++
			let row = csvdata[i]
			try {
				let slug = row[0]
				let name = row[1]
				if (slug && name) {
					let collection = { slug, name }
					validCollections.push(collection)
				} else {
					throw 'All the fields are not filled at row '
				}
			} catch (error) {
				let errorrow = Number(i) + 1
				errors.push('Row : ' + errorrow + ', Error : ' + error)
				console.log('Row : ', errorrow, ', Error : ', error)
			}
		}
		console.log(validCollections)
		this.setState({ totalCSVRows, validCollections, errors })
	}

	render () {
		const {
			loading,
			collections,
			totalCSVRows,
			errors,
			validCollections
		} = this.state
		console.log(collections)
		let errorTexts = []
		for (let i = 0; i < errors.length; i++) {
			errorTexts.push(<div key={i}>{errors[i]}</div>)
		}
		return (
			<Card>
				<CardHeader>Collections Bulk Upload</CardHeader>
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
						{validCollections.length > 0 && (
							<Container>
								<Row>
									<Button
										color='primary'
										onClick={this.uploadCollections}
									>
										Upload
									</Button>
								</Row>
								<Row>
									<ListGroup>
										{validCollections.map(
											(validCollection, index) => {
												return (
													<ListGroupItem key={index}>
														<ListGroupItemHeading>
															{index +
																1 +
																') ' +
																validCollection.name +
																'    '}
														</ListGroupItemHeading>
														<ListGroupItemText>
															{
																validCollection.slug
															}
														</ListGroupItemText>
													</ListGroupItem>
												)
											}
										)}
									</ListGroup>
								</Row>
							</Container>
						)}
					</CardBody>
				)}
			</Card>
		)
	}
}

export default withFirebase(CollectionsBulkUpload)
