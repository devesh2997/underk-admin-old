import React, { Component } from 'react'

import { withFirebase } from '../../firebase'

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
	PopoverBody
} from 'reactstrap'

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

const WIDGET_TYPES = {
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
		let { landingWidgetsLocal } = this.state
		let widget = landingWidgetsLocal.splice(source.index, 1)
		landingWidgetsLocal.splice(destination.index, 0, widget[0])
		this.setState({ landingWidgetsLocal })
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
		let isDifferent = false
		for (let i = 0; i < landingWidgetsLocal.length; i++) {
			console.log(landingWidgetsLocal[i].id, landingWidgetsInDB[i].id)
			if (landingWidgetsLocal[i].id != landingWidgetsInDB[i].id) {
				isDifferent = true
				break
			}
		}
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
									<Button color='link'>Insert</Button>
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
															draggableId={index.toString()}
															index={index}
															key={index}
														>
															{provided => (
																<LandingWidget
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
	render () {
		const { provided, innerRef, doc, index } = this.props
		return (
			<div {...provided.draggableProps} ref={innerRef}>
				<Card>
					<CardHeader {...provided.dragHandleProps}>
						<i className='fa fa-bars'></i>
						{doc.priority + ') ' + doc.type}
					</CardHeader>
					<CardBody>
						<LandingWidgetView widget={doc} />
					</CardBody>
				</Card>

				<CardFooter style={{ marginBottom: 10 }}>
					<Button color='link'>Insert</Button>
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
	}

	render () {
		const widget = this.props.widget
		return (
			<Container>
				{widget.heading && (
					<Row>
						{widget.heading.title && (
							<Col>
								<strong>{widget.heading.title}</strong>
							</Col>
						)}
						{widget.heading.subtitle && (
							<Col>{widget.heading.subtitle}</Col>
						)}
						{widget.heading.alignment && (
							<Col>
								{'Alignment: ' + widget.heading.alignment}
							</Col>
						)}
					</Row>
				)}
				{widget.child && (
					<ChildView child={widget.child} id={'id' + widget.id} />
				)}
				{widget.children && (
					<Row style={{ marginTop: 20 }}>
						{widget.children.map((child, index) => {
							return (
								<ChildView
									key={index}
									child={child}
									id={'id' + widget.id + index}
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
					id={id}
					onMouseEnter={this.toggle}
					onMouseLeave={this.toggle}
				>
					<img
						src={child.src}
						style={{ maxsrcth: 150, maxHeight: 150 }}
					/>
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

export default withFirebase(MobileHomeWidgetsManager)
