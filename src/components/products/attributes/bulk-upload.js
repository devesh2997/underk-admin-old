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

class AttributesBulkUpload extends Component {
	constructor (props) {
		super(props)

		this.state = {
			loading: false,
			attributes: null,
			errors: [],
			validAttributes: []
		}
	}

	addAttribute = async attribute => {
		let type = attribute.type
		let subtype = attribute.subtype
		let name = attribute.name
		let value_name = attribute.value_name
		let value_id = attribute.value_id
		let value_sku = attribute.value_sku
		let value_hexcode
		if (name === 'color') {
			value_hexcode = attribute.value_hexcode
			if (!value_hexcode) {
				throw 'hexcode not provided for attribute of type color'
				return
			}
		}
		let obj = {}
		obj['id'] = value_id
		obj['name'] = value_name
		if (value_sku) obj['sku'] = value_sku
		if (value_hexcode) obj['hexcode'] = value_hexcode
		if (!subtype) subtype = ''
		let doc = {}
		doc.type = type
		doc.subtypes = {}
		doc.subtypes[subtype] = {}
		doc.subtypes[subtype][name] = {}
		doc.subtypes[subtype][name][value_id] = obj

		await this.props.firebase.attributesOfType(type).set(doc, { merge: true })
	}

	uploadAttributes = async () => {
		this.setState({ loading: true })
		let { validAttributes } = this.state
		for (let i = 0; i < validAttributes.length; i++) {
			let attributes = await this.getAttributes()
			console.log(attributes)
			let validAttribute = validAttributes[i]
			await this.addAttribute(validAttribute)
		}
		this.setState({ loading: false })
	}

	getAttributes = async () => {
		let snapshots = await this.props.firebase.attributesAll().get()
		if (!snapshots.empty) {
			snapshots = snapshots.docs
			let attributes = []

			snapshots.forEach(doc =>
				attributes.push({ ...doc.data(), cid: doc.id })
			)

			return attributes
		} else {
			return null
		}
	}

	fetchAttributes = async () => {
		this.setState({ loading: true })
		let attributes = await this.getAttributes()
		this.setState({ loading: false, attributes })
	}

	componentDidMount () {
		// this.fetchAttributes()
	}

	handleFileSelection = async csvdata => {
		let totalCSVRows = 0
		let validAttributes = []
		let errors = []
		console.log(csvdata)
		for (let i in csvdata) {
			if (Number(i) !== csvdata.length) totalCSVRows++
			let row = csvdata[i]
			try {
				let type = row[0]
				let subtype = row[1]
				let name = row[2]
				let value_id = row[3]
				let value_name = row[4]
				let value_sku = row[5]
				let value_hexcode = row[6]
				if (type && subtype && name && value_id && value_name) {
					let attribute = {
						type,
						subtype,
						name,
						value_id,
						value_name,
						value_sku,
						value_hexcode
					}
					validAttributes.push(attribute)
				} else {
					throw 'All the fields are not filled at row '
				}
			} catch (error) {
				let errorrow = Number(i) + 1
				errors.push('Row : ' + errorrow + ', Error : ' + error)
				console.log('Row : ', errorrow, ', Error : ', error)
			}
		}
		console.log(validAttributes)
		this.setState({ totalCSVRows, validAttributes, errors })
	}

	render () {
		const {
			loading,
			attributes,
			totalCSVRows,
			errors,
			validAttributes
		} = this.state
		console.log(attributes)
		let errorTexts = []
		for (let i = 0; i < errors.length; i++) {
			errorTexts.push(<div key={i}>{errors[i]}</div>)
		}
		return (
			<Card>
				<CardHeader>Attributes Bulk Upload</CardHeader>
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
						{validAttributes.length > 0 && (
							<Container>
								<Row>
									<Button
										color='primary'
										onClick={this.uploadAttributes}
									>
										Upload
									</Button>
								</Row>
								<Row>
									<ListGroup>
										{validAttributes.map(
											(validAttribute, index) => {
												return (
													<ListGroupItem key={index}>
														<ListGroupItemHeading>
															{index +
																1 +
																') ' +
																validAttribute.name +
																'    '}
														</ListGroupItemHeading>
														<ListGroupItemText>
															{
																validAttribute.slug
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

export default withFirebase(AttributesBulkUpload)
