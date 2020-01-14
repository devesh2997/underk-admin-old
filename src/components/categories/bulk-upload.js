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

class CategoriesBulkUpload extends Component {
	constructor (props) {
		super(props)

		this.state = {
			loading: false,
			categories: null,
			errors: [],
			validCategories: []
		}
	}

	addCategory = async (cid, name, parent, slug, sku, extras, categories) => {
		let ancestors = []
		let slugFamily = []
		let parent_category
		if (categories)
			parent_category = categories.find(
				category => category.cid === parent
			)
		if (parent_category) {
			ancestors = parent_category.ancestors
			slugFamily = parent_category.slugFamily
			const { cid, slug, name } = parent_category
			ancestors.push({
				cid,
				name,
				slug
			})
			slugFamily.push(slug)
		}
		slugFamily.push(slug)
		if (!parent) parent = ''

		await this.props.firebase.category(cid).set({
			name,
			parent,
			slug,
			sku,
			extras,
			ancestors,
			slugFamily
		})
	}

	uploadCategories = async () => {
		this.setState({ loading: true })
		let { validCategories } = this.state
		for (let i = 0; i < validCategories.length; i++) {
			let categories = await this.getCategories()
			console.log(categories)
			let validCategory = validCategories[i]
			await this.addCategory(
				validCategory.slug,
				validCategory.name,
				validCategory.parent,
                validCategory.slug,
				validCategory.sku,
				validCategory.extras,
				categories
			)
		}
		this.setState({ loading: false })
	}

	getCategories = async () => {
		let snapshots = await this.props.firebase.categories().get()
		if (!snapshots.empty) {
			snapshots = snapshots.docs
			let categories = []

			snapshots.forEach(doc =>
				categories.push({ ...doc.data(), cid: doc.id })
			)

			return categories
		} else {
			return null
		}
	}

	fetchCategories = async () => {
		this.setState({ loading: true })
		let categories = await this.getCategories()
		this.setState({ loading: false, categories })
	}

	componentDidMount () {
		// this.fetchCategories()
	}

	handleFileSelection = async csvdata => {
		let totalCSVRows = 0
		let validCategories = []
		let errors = []
		console.log(csvdata)
		for (let i in csvdata) {
			if (Number(i) !== csvdata.length) totalCSVRows++
			let row = csvdata[i]
			try {
				let slug = row[0]
				let name = row[1]
				let sku = row[2]
				let parent = row[3]
				let extras = row[4] ? JSON.parse(row[4]) : []
				if (slug && name && sku) {
					let category = { slug, name, sku, extras }
					if (parent && parent.length > 0) {
						category['parent'] = parent
					}
					validCategories.push(category)
				} else {
					throw 'All the fields are not filled at row '
				}
			} catch (error) {
				let errorrow = Number(i) + 1
				errors.push('Row : ' + errorrow + ', Error : ' + error)
				console.log('Row : ', errorrow, ', Error : ', error)
			}
		}
		console.log(validCategories)
		this.setState({ totalCSVRows, validCategories, errors })
	}

	render () {
		const {
			loading,
			categories,
			totalCSVRows,
			errors,
			validCategories
		} = this.state
		console.log(categories)
		let errorTexts = []
		for (let i = 0; i < errors.length; i++) {
			errorTexts.push(<div key={i}>{errors[i]}</div>)
		}
		return (
			<Card>
				<CardHeader>Categories Bulk Upload</CardHeader>
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
						{validCategories.length > 0 && (
							<Container>
								<Row>
									<Button
										color='primary'
										onClick={this.uploadCategories}
									>
										Upload
									</Button>
								</Row>
								<Row>
									<ListGroup>
										{validCategories.map(
											(validCategory, index) => {
												return (
													<ListGroupItem key={index}>
														<ListGroupItemHeading>
															{index +
																1 +
																') ' +
																validCategory.name +
																'    '}
														</ListGroupItemHeading>
														<ListGroupItemText>
															{validCategory.slug}
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

export default withFirebase(CategoriesBulkUpload)
