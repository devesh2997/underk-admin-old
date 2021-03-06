import React, { Component } from 'react'
import { withFirebase } from '../../firebase'
import * as utils from '../../utils'
import types from 'underk-types'

import {
	getDateTimeStampFromDate,
	timeStampToTimeLocaleString,
	timeStampToDateLocaleString,
	isEmpty,
	addDays
} from '../../utils/index'
import DatePicker from 'react-datepicker'

import './style.css'

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
	Collapse,
	Alert
} from 'reactstrap'

class UrlShortener extends Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: false,
			redirectUrl: '',
			shortUrls: [],
			message: '',
			error: '',
			forceCreateShortUrl: false,
			trackShortUrl: false
		}
	}

	onChecked = event => {
		this.setState({ [event.target.name]: event.target.checked })
	}

	onChange = event => {
		this.setState({ [event.target.name]: event.target.value })
	}

	onDelete = async index => {
		let shortUrls = this.state.shortUrls
		const shortUrl = shortUrls[index]
		shortUrls.splice(index, 1)

		this.setState({ shortUrls, loading: true, message: '', error: '' })

		await this.props.firebase.shortUrl(shortUrl).delete()

		this.setState({ loading: false })
	}

	getShortUrl = async url => {
		let urlSnapshot = await this.props.firebase.shortUrlForUrl(url).get()
		if (urlSnapshot.empty) return null
		else return urlSnapshot.docs.map(doc=>doc.id)
	}

	checkForExistingShortUrl = async () => {
		this.setState({ loading: true, message: '', shortUrl: '', error: '' })
		let urls = await this.getShortUrl(this.state.redirectUrl)
		let error = ''
		let shortUrls = []
		if (!utils.isEmpty(urls)) {
			shortUrls = urls
		} else {
			error = 'Short URL does not exist for the given url.'
		}
		this.setState({ shortUrls, error, loading: false })
	}

	createShortUrl = async () => {
		let { forceCreateShortUrl, trackShortUrl } = this.state
		this.setState({ loading: true, message: '', shortUrls: [], error: '' })
		let error = ''
		let message = ''
		let shortUrls
		const redirectUrl = this.state.redirectUrl
		if (!forceCreateShortUrl)
			shortUrls = await this.getShortUrl(redirectUrl)
		if (forceCreateShortUrl || utils.isEmpty(shortUrls)) {
			const createShortUrlActionId = await this.props.firebase.createShortUrlAction(
				redirectUrl,
				trackShortUrl
			)
			this.props.firebase
				.action(createShortUrlActionId)
				.onSnapshot(async snapshot => {
					if (snapshot.exists) {
						let action = snapshot.data()
						if (action.status === types.ACTION_STATUS_ERROR) {
							this.setState({
								loading: false,
								error: action.error
							})
						} else if (
							action.status === types.ACTION_STATUS_PROCESSING ||
							action.status === types.ACTION_STATUS_INIT
						) {
							this.setState({ loading: true })
						} else if (
							action.status === types.ACTION_STATUS_COMPLETED
						) {
							shortUrls = await this.getShortUrl(redirectUrl)
							this.setState({
								loading: false,
								shortUrls
							})
						}
					} else {
						this.setState({
							loading: false,
							error:
								'Some error occurred in creating the required action.'
						})
					}
				})
		} else {
			message = 'Short URL already exists for this url.	'
			this.setState({ shortUrls, message, error, loading: false })
		}
	}

	render () {
		let {
			loading,
			redirectUrl,
			shortUrls,
			message,
			error,
			forceCreateShortUrl,
			trackShortUrl
		} = this.state

		let validUrl =
			redirectUrl.startsWith('https://') ||
			redirectUrl.startsWith('http://')
		// validUrl = validUrl && redirectUrl.split('.').length === 3

		return (
			<Card>
				<CardHeader>URL Shortener</CardHeader>
				<CardBody>
					<Row>
						<Col>
							<InputGroup>
								<InputGroupAddon addonType='prepend'>
									<InputGroupText>
										Redirect/Original URL :{' '}
									</InputGroupText>
								</InputGroupAddon>
								<Input
									value={redirectUrl}
									name='redirectUrl'
									onChange={this.onChange}
								></Input>
							</InputGroup>
						</Col>
					</Row>
					<Row style={{ marginTop: '20px', marginBottom: '20px' }}>
						<Col sm='1'></Col>
						<Col>
							<Label check>
								<Input
									type='checkbox'
									onChange={this.onChecked}
									name='forceCreateShortUrl'
									checked={forceCreateShortUrl}
								/>{' '}
								Force create short.
							</Label>
						</Col>
						<Col>
							<Label check>
								<Input
									type='checkbox'
									onChange={this.onChecked}
									name='trackShortUrl'
									checked={trackShortUrl}
								></Input>
								Track the redirects from the created short url
							</Label>
						</Col>
						<Col sm='1'></Col>
					</Row>
					{loading && (
						<i className='fa fa-refresh fa-spin fa-3x fa-fw' />
					)}
					{validUrl && !loading && (
						<Row
							style={{ marginTop: '20px', marginBottom: '20px' }}
						>
							<Col sm='2'></Col>
							<Col sm='4'>
								<Button
									color='primary'
									onClick={this.checkForExistingShortUrl}
								>
									Check for existing short URL
								</Button>
							</Col>
							<Col sm='4'>
								<Button
									color='primary'
									onClick={this.createShortUrl}
								>
									Create new short URL
								</Button>
							</Col>
							<Col sm='2'></Col>
						</Row>
					)}
					{shortUrls.length > 0 && (
						<ListGroup>
							{shortUrls.map((shortUrl, index) => (
								<ListGroupItem key={index}>
									<Row>
										<Col sm='10'>
											Short URL :{' '}
											<a
												href={
													'https://under-k.tk/s/' +
													shortUrl
												}
												target='_blank'
											>
												{'https://under-k.tk/s/' +
													shortUrl}
											</a>
										</Col>
										<Col sm='2'>
											<Button
												type='button'
												color='danger'
												onClick={() =>
													this.onDelete(index)
												}
											>
												<i className='fa fa-trash' />
											</Button>
										</Col>
									</Row>
								</ListGroupItem>
							))}
						</ListGroup>
					)}
					{message.length > 0 && (
						<Row>
							<Col>
								<Alert color='success'>{message}</Alert>
							</Col>
						</Row>
					)}
					{error.length > 0 && (
						<Row>
							<Col>
								<Alert color='danger'>{error}</Alert>
							</Col>
						</Row>
					)}
				</CardBody>
			</Card>
		)
	}
}

export default withFirebase(UrlShortener)
