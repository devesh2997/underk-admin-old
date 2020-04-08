import React, { Component } from 'react'
import { withFirebase } from '../../firebase'

import {
	getDateTimeStampFromDate,
	timeStampToTimeLocaleString,
	timeStampToDateLocaleString,
	isEmpty
} from '../../utils/index'
import DatePicker from 'react-datepicker'

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
	Collapse
} from 'reactstrap'

class ExportInventory extends Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: false,
			sheets: [],
			category_id: 'all',
			loadingCategories: false,
			categories: []
		}
	}

	componentDidMount () {
		this.setState({ loading: true, loadingCategories: true })

		this.unsubscribe = this.props.firebase.db
			.collection('actions')
			.where('type', '==', 'EXPORT_INVENTORY')
			.onSnapshot(snapshot => {
				let sheets = []
				snapshot.forEach(doc =>
					sheets.push({ ...doc.data(), id: doc.id })
				)
				console.log(sheets)
				this.setState({ sheets, loading: false })
			})

		this.getCategories = this.props.firebase
			.categories()
			.onSnapshot(snapshot => {
				let categories = []
				snapshot.forEach(doc =>
					categories.push({ ...doc.data(), cid: doc.id })
				)
				console.log(categories)
				this.setState({ categories, loadingCategories: false })
			})
	}

	generate = () => {
		const { category_id } = this.state
		this.props.firebase.db.collection('actions').add({
			status: 'init',
			type: 'EXPORT_INVENTORY',
			category_id: category_id
		})
	}

	onChange = event => {
		this.setState({ [event.target.name]: event.target.value })
	}

	render () {
		let {
			loading,
			category_id,
			sheets,
			loadingCategories,
			categories
		} = this.state
		console.log(category_id)
		return (
			<Card>
				<CardHeader>Export Inventory as CSV</CardHeader>
				<CardBody>
					<Row>
						<Col>
							<InputGroup>
								<InputGroupAddon addonType='prepend'>
									<InputGroupText>Category</InputGroupText>
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
						<Col>
							<Button color='primary' onClick={this.generate}>
								Generate
							</Button>
						</Col>
					</Row>
					{loading ||
						(loadingCategories && (
							<i className='fa fa-refresh fa-spin fa-3x fa-fw' />
						))}
					{!loading && !loadingCategories && (
						<ListGroup style={{ marginTop: '20px' }}>
							{sheets.map((sheet, index) => {
								return (
									<ListGroupItem key={index}>
										<Row>
											<Col sm='2'>{index + 1 + ') '}</Col>
											<Col>
												Category ID: {sheet.category_id}
											</Col>
											{sheet.status === 'completed' && (
												<Col>
													<a
														href={sheet.downloadURL}
														target='_blank'
													>
														<Button color='primary'>
															Download CSV
														</Button>
													</a>
												</Col>
											)}
											{sheet.status !== 'completed' && (
												<Col>{sheet.status}</Col>
											)}
											{sheet.status === 'error' && (
												<Col>{sheet.error}</Col>
											)}
										</Row>
									</ListGroupItem>
								)
							})}
						</ListGroup>
					)}
				</CardBody>
			</Card>
		)
	}
}

export default withFirebase(ExportInventory)
