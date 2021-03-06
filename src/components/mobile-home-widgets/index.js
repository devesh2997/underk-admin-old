import React, { Component } from 'react'

import { withFirebase } from '../../firebase'
import Firebase from '../../firebase/firebase'

import './style.css'

import {
	Container,
	Card,
	CardBody,
	CardHeader,
	CardFooter,
	Spinner,
	Button,
	ListGroup,
	ListGroupItem,
	ListGroupItemHeading,
	ListGroupItemText,
	Row,
	Col,
	Label,
	Popover,
	PopoverHeader,
	PopoverBody,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	Input,
	Form,
	FormGroup
} from 'reactstrap'

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Link } from 'react-router-dom'
import ROUTES from '../../routes'

export const WIDGET_TYPES = {
	IMAGE: 'image',
	BANNER: 'banner',
	COOLSLIDER: 'coolslider',
	QUOTE: 'quote',
	CAROUSEL: 'carousel',
	GRID: 'grid'
}

class MobileHomeWidgetsManager extends Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: true,
			landingWidgetsInDB: [],
			landingWidgetsLocal: []
		}
	}

	componentDidMount () {
		this.unsubscribe = this.props.firebase
			.landingWidgets()
			.onSnapshot(snapshot => {
				let l = []
				let docs = snapshot.docs
				for (let i = 0; i < docs.length; i++) {
					let d = docs[i].data()
					d['id'] = docs[i].id
					l.push(d)
				}
				this.setState({
					landingWidgetsInDB: l,
					landingWidgetsLocal: l,
					loading: false
				})
			})
	}

	componentWillUnmount () {
		this.unsubscribe()
	}

	getLandingWidgetView = (doc, index) => {
		if (doc.exists) {
			let id = doc.id
			doc = doc.data()
			return (
				<Draggable draggableId={id} index={index}>
					{provided => (
						<ListGroupItem
							key={id}
							{...provided.draggableProps}
							innerRef={provided.innerRef}
						>
							<ListGroupItemHeading {...provided.dragHandleProps}>
								{index + 1 + ') ' + doc.type}
							</ListGroupItemHeading>{' '}
							<ListGroupItemText>
								{doc.priority}
							</ListGroupItemText>
						</ListGroupItem>
					)}
				</Draggable>
			)
		}
	}

	onDragEnd = async result => {
		console.log('drag ended', result)
		const { source, destination } = result
		if (destination === null || source.index === destination.index) return
		let landingWidgets = Array.from(this.state.landingWidgetsLocal)
		let [widget] = landingWidgets.splice(source.index, 1)
		landingWidgets.splice(destination.index, 0, widget)
		this.setState({ landingWidgetsLocal: landingWidgets })
	}

	revert = () => {
		this.setState({ landingWidgetsLocal: this.state.landingWidgetsInDB })
	}

	updateLandingWidgets = async () => {
		let landingWidgetsLocal = this.state.landingWidgetsLocal
		this.setState({ updating: true })
		for (let i = 0; i < landingWidgetsLocal.length; i++) {
			let l = landingWidgetsLocal[i]
			l['priority'] = i
			await this.props.firebase
				.landingWidget(landingWidgetsLocal[i].id)
				.set(l, { merge: true })
		}
		this.setState({ updating: false })
	}

	render () {
		const {
			loading,
			updating,
			landingWidgetsLocal,
			landingWidgetsInDB
		} = this.state
		// let isDifferent = false
		// for (let i = 0; i < landingWidgetsLocal.length; i++) {
		// 	console.log(landingWidgetsLocal[i].id, landingWidgetsInDB[i].id)
		// 	if (landingWidgetsLocal[i].id != landingWidgetsInDB[i].id) {
		// 		isDifferent = true
		// 		break
		// 	}
		// }
		return (
			<Card>
				<CardHeader>
					<Row>
						<Col>Mobile Home Widgets Manager</Col>
						{!loading && !updating && (
							<Row>
								<Col>
									<Button
										color='primary'
										onClick={this.updateLandingWidgets}
									>
										Update
									</Button>
								</Col>
								<Col>
									<Button
										color='primary'
										onClick={this.revert}
									>
										Reset
									</Button>
								</Col>
							</Row>
						)}
					</Row>
				</CardHeader>
				<CardBody>
					{(loading || updating) && <Spinner color='primary' />}

					<DragDropContext onDragEnd={this.onDragEnd}>
						{!loading && !updating && (
							<Container>
								<CardFooter style={{ marginBottom: 10 }}>
									<Link
										to={{
											pathname: `${ROUTES.HOME_WIDGETS.path}/add`,
											state: {
												priority: 0
											}
										}}
									>
										Insert
									</Link>
								</CardFooter>
								<Droppable droppableId='landing-widgets'>
									{provided => (
										<List
											innerRef={provided.innerRef}
											provided={provided}
										>
											{landingWidgetsLocal.map(
												(doc, index) => {
													return (
														<Draggable
															draggableId={doc.id}
															key={doc.id}
															index={index}
														>
															{provided => (
																<LandingWidget
																	firebase={
																		this
																			.props
																			.firebase
																	}
																	provided={
																		provided
																	}
																	innerRef={
																		provided.innerRef
																	}
																	doc={doc}
																	index={
																		index
																	}
																></LandingWidget>
															)}
														</Draggable>
													)
												}
											)}

											{provided.placeholder}
										</List>
									)}
								</Droppable>
							</Container>
						)}
					</DragDropContext>
				</CardBody>
			</Card>
		)
	}
}

class List extends React.Component {
	render () {
		const { provided, innerRef, children } = this.props
		return (
			<div {...provided.droppableProps} ref={innerRef}>
				{children}
			</div>
		)
	}
}

class LandingWidget extends React.Component {
	onDelete = () => {
		const { doc, firebase } = this.props
		if (window.confirm('Are you sure you want to delete this widget ?')) {
			this.props.firebase.landingWidget(doc.id).delete()
		}
	}
	render () {
		const { provided, innerRef, doc, index } = this.props
		return (
			<div {...provided.draggableProps} ref={innerRef}>
				<Card>
					<CardHeader {...provided.dragHandleProps}>
						<Row>
							<Col>
								<i className='fa fa-bars mr-2'></i>
								{doc.priority + ') ' + doc.type}
							</Col>
							<Col className='text-right'>
								<Button color='danger' className='text-right' onClick={this.onDelete}>
									Delete
								</Button>
							</Col>
						</Row>
					</CardHeader>
					<CardBody>
						<LandingWidgetView
							firebase={this.props.firebase}
							widget={doc}
						/>
					</CardBody>
				</Card>

				<CardFooter style={{ marginBottom: 10 }}>
					<Link
						to={{
							pathname: `${ROUTES.HOME_WIDGETS.path}/add`,
							state: {
								priority: doc.priority + 1
							}
						}}
					>
						Insert
					</Link>
				</CardFooter>
				{/* <ListGroupItem>
					<ListGroupItemHeading></ListGroupItemHeading>{' '}
					<ListGroupItemText>{doc.priority}</ListGroupItemText>

				</ListGroupItem> */}
			</div>
		)
	}
}

class LandingWidgetView extends Component {
	constructor (props) {
		super(props)
		let widget = this.props.widget
		if (!widget.heading) {
			widget.heading = {
				title: '',
				subtitle: '',
				alignment: ''
			}
		} else {
			if (!widget.heading.title) widget.heading.title = ''
			if (!widget.heading.subtitle) widget.heading.subtitle = ''
			if (!widget.heading.alignment) widget.heading.alignment = 'start'
		}
		if (!widget.childAspectRatio) widget.childAspectRatio = 1
		this.state = { widget }
	}

	onChangeHeading = event => {
		let widget = this.state.widget
		widget.heading[event.target.name] = event.target.value
		this.setState({
			widget
		})
	}

	onChange = event => {
		let widget = this.state.widget
		widget.childAspectRatio = event.target.value

		this.setState({ widget })
	}

	onChangeBackgroundColor = async event => {
		let widget = this.state.widget
		if (event.target.value) {
			widget.backgroundColor = event.target.value
		} else {
			widget.backgroundColor = '#ffffff'
		}

		this.setState({ widget })
	}

	onSubmit = async event => {
		let widget = this.state.widget
		if (!widget.childAspectRatio) {
			widget.childAspectRatio = 1
		} else {
			widget.childAspectRatio = Number(widget.childAspectRatio)
		}
		this.setState({ updating: true })
		await this.props.firebase
			.landingWidget(widget.id)
			.set(widget, { merge: true })
		this.setState({ updating: false })
	}

	onUpdate = async child => {
		let { widget, editingIndex } = this.state
		this.setState({ updating: true })
		if (editingIndex === -1) {
			widget.child = child
		} else {
			widget.children[editingIndex] = child
		}
		await this.props.firebase
			.landingWidget(widget.id)
			.set(widget, { merge: true })
		this.onEditCancel()
		this.setState({ updating: false })
	}

	onEditCancel = () => {
		this.setState({
			editing: false,
			editingIndex: null
		})
	}

	render () {
		let { updating, widget, editing, editingIndex } = this.state
		return (
			<Container>
				{updating && (
					<i className='fa fa-refresh fa-spin fa-3x fa-fw' />
				)}
				{!updating && editing && (
					<EditChildView
						firebase={this.props.firebase}
						child={
							editingIndex == -1
								? widget.child
								: widget.children[editingIndex]
						}
						onUpdate={this.onUpdate}
						onCancel={this.onEditCancel}
					/>
				)}
				{!updating && !editing && (
					<Container>
						<Row>
							<Col>
								<Form onSubmit={this.onSubmit}>
									<InputGroup>
										<InputGroupAddon addonType='prepend'>
											<InputGroupText>
												Title
											</InputGroupText>
										</InputGroupAddon>
										<Input
											placeholder=''
											value={widget.heading.title}
											name='title'
											onChange={this.onChangeHeading}
										/>
										<InputGroupAddon addonType='append'>
											<Button
												color='primary'
												onClick={this.onSubmit}
											>
												<i
													className='fa fa-check'
													style={{ color: '#ffffff' }}
												></i>
											</Button>
										</InputGroupAddon>
									</InputGroup>
								</Form>
							</Col>

							<Col>
								<Form onSubmit={this.onSubmit}>
									<InputGroup>
										<InputGroupAddon addonType='prepend'>
											<InputGroupText>
												Subtitle
											</InputGroupText>
										</InputGroupAddon>
										<Input
											placeholder=''
											value={widget.heading.subtitle}
											name='subtitle'
											onChange={this.onChangeHeading}
										/>
										<InputGroupAddon addonType='append'>
											<Button
												color='primary'
												onClick={this.onSubmit}
											>
												<i
													className='fa fa-check'
													style={{ color: '#ffffff' }}
												></i>
											</Button>
										</InputGroupAddon>
									</InputGroup>
								</Form>
							</Col>

							<Col>
								<InputGroup>
									<InputGroupAddon addonType='prepend'>
										<InputGroupText>
											Alignment
										</InputGroupText>
									</InputGroupAddon>
									<Input
										type='select'
										name='alignment'
										id='exampleSelect'
										value={widget.heading.alignment}
										onChange={this.onChangeHeading}
									>
										<option>start</option>
										<option>end</option>
										<option>center</option>
									</Input>
									<InputGroupAddon addonType='append'>
										<Button
											color='primary'
											onClick={this.onSubmit}
										>
											<i
												className='fa fa-check'
												style={{ color: '#ffffff' }}
											></i>
										</Button>
									</InputGroupAddon>
								</InputGroup>
							</Col>
						</Row>
						<Row style={{ marginTop: '10px' }}>
							<Col sm='4'>
								<Form onSubmit={this.onSubmit}>
									<InputGroup>
										<InputGroupAddon addonType='prepend'>
											<InputGroupText>
												Child Aspect Ratio
											</InputGroupText>
										</InputGroupAddon>
										<Input
											placeholder=''
											value={widget.childAspectRatio}
											name='childAspectRatio'
											onChange={this.onChange}
										/>
										<InputGroupAddon addonType='append'>
											<Button
												color='primary'
												onClick={this.onSubmit}
											>
												<i
													className='fa fa-check'
													style={{ color: '#ffffff' }}
												></i>
											</Button>
										</InputGroupAddon>
									</InputGroup>
								</Form>
							</Col>
							<Col sm='4'>
								<Form onSubmit={this.onSubmit}>
									<InputGroup>
										<InputGroupAddon addonType='prepend'>
											<InputGroupText>
												Background Color
											</InputGroupText>
										</InputGroupAddon>
										<Input
											placeholder=''
											value={widget.backgroundColor}
											name='backgroundColor'
											onChange={
												this.onChangeBackgroundColor
											}
										/>
										<InputGroupAddon addonType='append'>
											<Button
												color='primary'
												onClick={this.onSubmit}
											>
												<i
													className='fa fa-check'
													style={{ color: '#ffffff' }}
												></i>
											</Button>
										</InputGroupAddon>
									</InputGroup>
								</Form>
							</Col>
						</Row>
					</Container>
				)}
				{!updating && !editing && widget.child && (
					<ChildView
						child={widget.child}
						id={'id' + widget.id}
						index={-1}
						toggleEdit={() => {
							this.setState({ editing: true, editingIndex: -1 })
						}}
					/>
				)}
				{!updating && !editing && widget.children && (
					<Row style={{ marginTop: 20 }}>
						{widget.children.map((child, index) => {
							return (
								<ChildView
									key={index}
									child={child}
									id={'id' + widget.id + index}
									index={index}
									toggleEdit={() => {
										this.setState({
											editing: true,
											editingIndex: index
										})
									}}
								></ChildView>
							)
						})}
					</Row>
				)}
			</Container>
		)
	}
}

class ChildView extends Component {
	constructor (props) {
		super(props)
		this.state = {
			popoverOpen: false
		}
	}
	toggle = () => this.setState({ popoverOpen: !this.state.popoverOpen })

	render () {
		let child = this.props.child
		let id = this.props.id
		let popoverOpen = this.state.popoverOpen
		return (
			<Col style={{ marginTop: 20 }}>
				<Container
					className='show-image'
					id={id}
					onMouseEnter={this.toggle}
					onMouseLeave={this.toggle}
					style={{ position: 'relative' }}
				>
					<img
						src={child.src}
						style={{ maxWidth: 300, maxHeight: 150 }}
					/>

					<button className='update'>
						<i
							className='fa fa-trash fa-2x'
							style={{ color: '#20a8d8' }}
						/>
					</button>
					<button className='delete' onClick={this.props.toggleEdit}>
						<i
							className='fa fa-edit fa-2x'
							style={{ color: '#20a8d8' }}
						/>
					</button>
					<i
						className={
							child.placeholder ? 'fa fa-check' : 'fa fa-ban'
						}
						style={{
							position: 'absolute',
							bottom: -20,
							left: 10,
							color: child.placeholder ? 'green' : 'red'
						}}
					/>
					{child.backgroundColor && (
						<span
							style={{
								position: 'absolute',
								bottom: -20,
								left: 40,
								height: '15px',
								width: '15px',
								backgroundColor: child.backgroundColor,
								borderRadius: '50%',
								display: 'inline-block'
							}}
						></span>
					)}
				</Container>
				{child.helm && (
					<Popover placement='top' isOpen={popoverOpen} target={id}>
						<PopoverHeader>Helm</PopoverHeader>
						<PopoverBody>
							{child.helm.destination && (
								<Label>
									Destination : {child.helm.destination}
								</Label>
							)}
							<br />
							{child.helm.destinationType && (
								<Label>
									Destination Type :{' '}
									{child.helm.destinationType}
								</Label>
							)}
						</PopoverBody>
					</Popover>
				)}
			</Col>
		)
	}
}

class EditChildView extends Component {
	constructor (props) {
		super(props)
		let child = this.props.child
		if (!child) {
			child = {
				helm: {
					destination: '',
					destinationType: ''
				},
				src: '',
				type: null,
				placeholder: '',
				backgroundColor: ''
			}
		} else {
			if (!child.helm)
				child.helm = {
					destination: '',
					destinationType: ''
				}
			if (!child.src) child.src = ''
			if (!child.type) child.type = null
			if (!child.placeholder) child.placeholder = ''
			if (!child.backgroundColor) child.backgroundColor = ''
		}
		this.state = {
			child,
			loadingCategories: true,
			loadingCollections: true,
			categories: [],
			collections: [],
			uploading: false
		}
	}

	componentDidMount () {
		this.getCategories = this.props.firebase
			.categories()
			.onSnapshot(snapshot => {
				let categories = []

				snapshot.forEach(doc =>
					categories.push({ ...doc.data(), cid: doc.id })
				)
				this.setState({
					categories,
					loadingCategories: false
				})
			})

		this.getCollections = this.props.firebase
			.collections()
			.onSnapshot(snapshot => {
				let collections = []

				snapshot.forEach(doc =>
					collections.push({ ...doc.data(), id: doc.id })
				)
				this.setState({
					collections,
					loadingCollections: false
				})
			})
	}

	componentWillUnmount () {
		this.getCategories()
		this.getCollections()
	}

	onChangeHelm = event => {
		let child = this.state.child
		child.helm[event.target.name] = event.target.value
		this.setState({
			child
		})
	}
	onChangeBackgroundColor = event => {
		let child = this.state.child
		child.backgroundColor = event.target.value
		this.setState({ child })
	}

	uploadTaskPromise = async (file, firebase) => {
		console.log('name', file.name)
		console.log(file)
		return new Promise(function (resolve, reject) {
			let storageRef = firebase.landingWidgetsAssetsRef()
			let uploadTask = storageRef.child(file.name).put(file)
			uploadTask.on(
				'state_changed',
				snapshot => {},
				error => {
					console.log(error)
					reject()
				},
				() => {
					uploadTask.snapshot.ref
						.getDownloadURL()
						.then(downloadURL => {
							resolve(downloadURL)
						})
				}
			)
		})
	}

	onUpdate = async () => {
		let { child, srcUpdateFile, placeholderUpdateFile } = this.state
		if (srcUpdateFile) {
			this.setState({ uploading: true })
			let srcURL = await this.uploadTaskPromise(
				srcUpdateFile,
				this.props.firebase
			)
			child.src = srcURL
		}
		if (placeholderUpdateFile) {
			this.setState({ uploading: true })
			let placeholderURL = await this.uploadTaskPromise(
				placeholderUpdateFile,
				this.props.firebase
			)
			child.placeholder = placeholderURL
		}
		this.setState({ uploading: false })
		this.props.onUpdate(child)
	}

	onSRCChanged = event => {
		let srcUpdateFile = Array.from(event.target.files)[0]
		this.setState({
			srcUpdate: URL.createObjectURL(event.target.files[0]),
			srcUpdateFile
		})
	}

	onPlaceholderChanged = event => {
		let placeholderUpdateFile = Array.from(event.target.files)[0]
		this.setState({
			placeholderUpdate: URL.createObjectURL(event.target.files[0]),
			placeholderUpdateFile
		})
	}

	render () {
		let {
			child,
			loadingCollections,
			loadingCategories,
			uploading,
			categories,
			collections,
			srcUpdate,
			placeholderUpdate
		} = this.state
		let destinationType = child.helm.destinationType
		if (!child) return <Container>No child selected</Container>
		if (loadingCategories || loadingCollections || uploading)
			return <i className='fa fa-refresh fa-spin fa-3x fa-fw' />
		return (
			<Container>
				<Row>
					<Col>
						<Button color='primary' onClick={this.props.onCancel}>
							Cancel
						</Button>
					</Col>
					<Col>
						<Button color='primary' onClick={this.onUpdate}>
							Update
						</Button>
					</Col>
				</Row>
				<Row style={{ marginTop: '30px' }}>
					<Col sm='3'>
						<Row>
							<img
								src={child.src}
								style={{ maxWidth: 150, maxHeight: 150 }}
							/>
						</Row>
						<Row style={{ marginTop: '10px' }}>
							<InputGroup>
								<Input
									placeholder='Choose SRC'
									type='file'
									onChange={this.onSRCChanged}
								/>
							</InputGroup>
						</Row>
						{srcUpdate && (
							<Row style={{ marginTop: '10px' }}>
								<img
									src={srcUpdate}
									style={{ maxWidth: 150, maxHeight: 150 }}
								/>
							</Row>
						)}
					</Col>
					<Col sm='3'>
						<Row>
							<img
								src={child.placeholder}
								style={{ maxWidth: 150, maxHeight: 150 }}
							/>
						</Row>
						<Row>
							<InputGroup>
								<Input
									placeholder='Choose Placeholder'
									type='file'
									onChange={this.onPlaceholderChanged}
								/>
							</InputGroup>
						</Row>
						{placeholderUpdate && (
							<Row style={{ marginTop: '10px' }}>
								<img
									src={placeholderUpdate}
									style={{ maxWidth: 150, maxHeight: 150 }}
								/>
							</Row>
						)}
					</Col>
					<Col sm='6'>
						<Row>
							<Col>
								<InputGroup>
									<InputGroupAddon addonType='prepend'>
										<InputGroupText>
											Destination Type
										</InputGroupText>
									</InputGroupAddon>
									<Input
										type='select'
										name='destinationType'
										id='exampleSelect'
										value={child.helm.destinationType}
										onChange={this.onChangeHelm}
									>
										<option></option>
										<option>category</option>
										<option>collection</option>
										<option>product</option>
										<option>website</option>
									</Input>
								</InputGroup>
							</Col>
						</Row>
						<Row>
							<Col>
								<InputGroup>
									<InputGroupAddon addonType='prepend'>
										<InputGroupText>
											Destination
										</InputGroupText>
									</InputGroupAddon>
									{destinationType === 'category' && (
										<Input
											type='select'
											name='destination'
											value={child.helm.destination}
											onChange={this.onChangeHelm}
										>
											{categories.map(
												(category, index) => {
													return (
														<option key={index}>
															{category.slug}
														</option>
													)
												}
											)}
										</Input>
									)}
									{destinationType === 'collection' && (
										<Input
											type='select'
											name='destination'
											value={child.helm.destination}
											onChange={this.onChangeHelm}
										>
											{collections.map(
												(collection, index) => {
													return (
														<option key={index}>
															{collection.slug}
														</option>
													)
												}
											)}
										</Input>
									)}
									{(destinationType === 'product' ||
										destinationType === 'website') && (
										<Input
											placeholder=''
											value={child.helm.destination}
											name='destination'
											onChange={this.onChangeHelm}
										/>
									)}
								</InputGroup>
							</Col>
						</Row>
						<Row style={{ marginTop: '30px' }}>
							<Col>
								<InputGroup>
									<InputGroupAddon addonType='prepend'>
										<InputGroupText>
											Background Color
										</InputGroupText>
										<Input
											placeholder=''
											value={child.backgroundColor}
											name='backgroundColor'
											onChange={
												this.onChangeBackgroundColor
											}
										/>
									</InputGroupAddon>
								</InputGroup>
							</Col>
						</Row>
					</Col>
				</Row>
			</Container>
		)
	}
}

export default withFirebase(MobileHomeWidgetsManager)
