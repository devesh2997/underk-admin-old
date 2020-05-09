import React from 'react';
import { Button, Card, CardBody, CardHeader, Col, Form, FormGroup, Input, Label } from 'reactstrap';
import { WIDGET_TYPES } from './index';
// import { withFirebase } from '../../firebase';
import ROUTES from '../../routes';

class AddWidget extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			type: '',
			priority: props.location.state ? props.location.state.priority.toString() : '0',
			childAspectRatio: '1',
			itemToScreenRatio: '',
			backgroundColor: '',
			title: '',
			subtitle: '',
			alignment: 'start',
			children: [],

			loadingCategories: true,
			categories: [],
			loadingCollections: true,
			collections: [],
			loadingWidgets: true,
			widgets: [],

			isAdding: false
		};
	}

	componentDidMount () {
		this.props.firebase
			.categories()
			.get()
			.then(snapshot => {
				let categories = []

				snapshot.forEach(doc =>
					categories.push({ ...doc.data(), cid: doc.id })
				)
				this.setState({
					categories,
					loadingCategories: false
				})
			})

		this.props.firebase
			.collections()
			.get()
			.then(snapshot => {
				let collections = []

				snapshot.forEach(doc =>
					collections.push({ ...doc.data(), id: doc.id })
				)
				this.setState({
					collections,
					loadingCollections: false
				})
			})

		this.props.firebase
			.landingWidgets()
			.get()
			.then(snapshot => {
				let widgets = []

				snapshot.forEach(doc =>
					widgets.push({ ...doc.data(), id: doc.id })
				)
				this.setState({
					widgets,
					loadingWidgets: false
				})
			})
	}

	onChange = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	}

	handleChildDeletion = (i) => {
		let children = Array.from(this.state.children);
		children.splice(i, 1);
		this.setState({ children });
	}

	handleChildAddition = (childData) => {
		let children = Array.from(this.state.children);
		children.push(childData);
		this.setState({ children });
	}

	handleChildDataChange = (i, childData) => {
		let children = Array.from(this.state.children);
		children[i] = childData;
		this.setState({ children });
	}

	uploadTaskPromise = async (file, firebase) => {
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

	onSubmit = async (event) => {
		event.preventDefault();
		this.setState({ isAdding: true });

		const {
			type,
			priority,
			childAspectRatio,
			title,
			subtitle,
			alignment,

			widgets,
		} = this.state;

		let widget = {
			type,
			priority: Number(priority),
			childAspectRatio: Number(childAspectRatio),
			heading: {
				title,
				subtitle,
				alignment
			}
		}
		if(this.state.itemToScreenRatio) {
			widget.itemToScreenRatio = Number(this.state.itemToScreenRatio);
		}
		if(this.state.backgroundColor) {
			widget.backgroundColor = this.state.backgroundColor;
		}
		if(this.state.children.length > 1) {
			let children = [];
			for(let i=0; i<this.state.children.length; i++) {
				let child = {
					type: 'image'
				};
				if(this.state.children[i].destinationType && this.state.children[i].destination) {
					child.helm = {
						destinationType: this.state.children[i].destinationType,
						destination: this.state.children[i].destination
					};
				}
				if(this.state.children[i].backgroundColor) {
					child.backgroundColor = this.state.children[i].backgroundColor;
				}
				child.src = await this.uploadTaskPromise(this.state.children[i].srcFile, this.props.firebase);
				if(this.state.children[i].placeholder) {
					child.placeholder = await this.uploadTaskPromise(this.state.children[i].placeholderFile, this.props.firebase);
				}
				children.push(child);
			}
			widget.children = children;
		} else {
			let child = {
				type: 'image'
			};
			for(let i=0; i<this.state.children.length; i++) {
				if(this.state.children[i].destinationType && this.state.children[i].destination) {
					child.helm = {
						destinationType: this.state.children[i].destinationType,
						destination: this.state.children[i].destination
					};
				}
				if(this.state.children[i].backgroundColor) {
					child.backgroundColor = this.state.children[i].backgroundColor;
				}
				child.src = await this.uploadTaskPromise(this.state.children[i].srcFile, this.props.firebase);
				if(this.state.children[i].placeholder) {
					child.placeholder = await this.uploadTaskPromise(this.state.children[i].placeholderFile, this.props.firebase);
				}
			}
			widget.child = child;
		}

		await this.props.firebase.db.collection('landing_widgets').add(widget);

		for(let i=0; i<widgets.length; i++) {
			if(widgets[i].priority >= widget.priority) {
				await this.props.firebase.landingWidget(widgets[i].id).set({
					priority: this.props.firebase.fieldValue.increment(1)
				}, { merge: true });
			}
		}

		this.setState({ isAdding: false });
		this.props.history.push(ROUTES.HOME_WIDGETS.path);
	}

	render() {
		const {
			type,
			priority,
			childAspectRatio,
			itemToScreenRatio,
			backgroundColor,
			title,
			subtitle,
			alignment,
			children,

			loadingCategories,
			categories,
			loadingCollections,
			collections,
			loadingWidgets,

			isAdding
		} = this.state;

		return (
			<Card>
				<CardHeader>
					<h4>Add Widget</h4>
				</CardHeader>
				<CardBody>
					<Form onSubmit={this.onSubmit}>
						<FormGroup>
							<Label>Type</Label>
							<Input type="text"
								list="type-list"
								name="type"
								value={type}
								onChange={this.onChange}
								placeholder="Enter type"
								required
							/>
							<datalist id="type-list">
								{Object.values(WIDGET_TYPES).map((t, idx) => (
									<option key={idx} value={t}>{t}</option>
								))}
							</datalist>
						</FormGroup>
						<FormGroup>
							<Label>Priority</Label>
							<Input type="number"
								name="priority"
								value={priority}
								onChange={this.onChange}
								placeholder="Enter priority"
								min="0"
								required
							/>
						</FormGroup>
						<FormGroup>
							<Label>Child aspect ratio</Label>
							<Input type="number"
								name="childAspectRatio"
								value={childAspectRatio}
								onChange={this.onChange}
								placeholder="Enter child aspect ratio"
								min="0"
								step="0.01"
								required
							/>
						</FormGroup>
						<FormGroup>
							<Label>Item to screen ratio</Label>
							<Input type="number"
								name="itemToScreenRatio"
								value={itemToScreenRatio}
								onChange={this.onChange}
								placeholder="Enter item to screen ratio"
								min="0"
								step="0.01"
							/>
						</FormGroup>
						<FormGroup>
							<Label>Background color</Label>
							<Input type="text"
								name="backgroundColor"
								value={backgroundColor}
								onChange={this.onChange}
								placeholder="Enter background color"
							/>
							<Input type="color"
								name="backgroundColor"
								value={backgroundColor}
								onChange={this.onChange}
							/>
						</FormGroup>
						<FormGroup>
							<h5>Heading</h5>
							<FormGroup>
								<Label>Title</Label>
								<Input type="text"
									name="title"
									value={title}
									onChange={this.onChange}
									placeholder="Enter title"
								/>
							</FormGroup>
							<FormGroup>
								<Label>Subtitle</Label>
								<Input type="text"
									name="subtitle"
									value={subtitle}
									onChange={this.onChange}
									placeholder="Enter subtitle"
								/>
							</FormGroup>
							<FormGroup>
								<Label>Alignment</Label>
								<Input type="select"
									name="alignment"
									value={alignment}
									onChange={this.onChange}
								>
									<option value="start">start</option>
									<option value="end">end</option>
									<option value="center">center</option>
								</Input>
							</FormGroup>
						</FormGroup>
						{loadingCategories || loadingCollections
							? (
								<div className="text-center" style={{ padding: '1rem 0' }}>
									<i className='fa fa-refresh fa-spin fa-3x fa-fw' />
								</div>
							)
							: (
								<div className="flex-card_container" style={{ display: 'block' }}>
									<h5 style={{ margin: '1rem 1.25rem 0.5rem' }}>Children</h5>
									{children.map((child, idx) => (
										<ChildCard
											key={child.id}
											categories={categories}
											collections={collections}
											child={child}
											onChildDataChange={(childData) => this.handleChildDataChange(idx, childData)}
											action="delete"
											onAction={() => this.handleChildDeletion(idx)}
										/>
									))}
									<ChildCard
										categories={categories}
										collections={collections}
										onAction={(childData) => this.handleChildAddition(childData)}
									/>
								</div>
							)
						}
						<FormGroup>
							<Button type="submit"
								color="primary"
								disabled={loadingCategories || loadingCollections || loadingWidgets || isAdding}>
								{isAdding
									? <i className='fa fa-refresh fa-spin fa-fw' />
									: 'Add'
								}
							</Button>
						</FormGroup>
					</Form>
				</CardBody>
			</Card>
		);
	}
}

// export default withFirebase(AddWidget);



class ChildCard extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			src: props.child ? props.child.src : '',
			srcFile: props.child ? props.child.srcFile : {},
			placeholder: props.child ? props.child.placeholder : '',
			placeholderFile: props.child ? props.child.placeholderFile : {},
			destinationType: props.child ? props.child.destinationType : '',
			destination: props.child ? props.child.destination : '',
			backgroundColor: props.child ? props.child.backgroundColor : ''
		};

		this.INITIAL_STATE = {
			src: '',
			srcFile: {},
			placeholder: '',
			placeholderFile: {},
			destinationType: '',
			destination: '',
			backgroundColor: ''
		};
	}

	onChange = (e) => {
		this.setState({ [e.target.name]: e.target.value });

		if(this.props.action === 'delete') {
			this.props.onChildDataChange(this.state);
		}
	}

	onFileChange = (e) => {
		const targetName = e.target.name;
		const file = e.target.files[0];
		this.setState({
			[targetName]: URL.createObjectURL(file),
			[`${targetName}File`]: file
		});

		if(this.props.action === 'delete') {
			this.props.onChildDataChange(this.state);
		}
	}

	renderDestinationInput = () => {
		const { destinationType, destination } = this.state;
		switch(destinationType) {
			case 'category':
				return (
					<Input type='select'
						name='destination'
						value={destination}
						onChange={this.onChange}
					>
						<option value="">Select destination</option>
						{this.props.categories.map(category => (
							<option key={category.cid} value={category.slug}>{category.slug}</option>
						))}
					</Input>
				);
			case 'collection':
				return (
					<Input type='select'
						name='destination'
						value={destination}
						onChange={this.onChange}
					>
						<option value="">Select destination</option>
						{this.props.collections.map(collection => (
							<option key={collection.id} value={collection.slug}>{collection.slug}</option>
						))}
					</Input>
				);
			default:
				return (
					<Input type='text'
						name='destination'
						value={destination}
						onChange={this.onChange}
						placeholder="Enter destination"
					/>
				);
		}
	}

	render() {
		const {
			src,
			placeholder,
			destinationType,
			backgroundColor
		} = this.state;
		const { action, onAction } = this.props;

		return (
			<Card style={{ margin: '1rem' }}>
				<CardBody>
					<FormGroup row style={{ margin: '1rem 0' }}>
						<Col>
							<img src={src} alt="Original" style={{ maxWidth: '150px' }} />
						</Col>
						<Col>
							<Label>Choose src</Label>
							<Input type="file"
								name="src"
								onChange={this.onFileChange}
							/>
						</Col>
					</FormGroup>
					<FormGroup row style={{ margin: '1rem 0' }}>
						<Col>
							<img src={placeholder} alt="Placeholder" style={{ maxWidth: '150px' }} />
						</Col>
						<Col>
							<Label>Choose placeholder</Label>
							<Input type="file"
								name="placeholder"
								onChange={this.onFileChange}
							/>
						</Col>
					</FormGroup>
					<FormGroup>
						<Label>Destination type</Label>
						<Input type='select'
							name='destinationType'
							value={destinationType}
							onChange={this.onChange}
						>
							<option value="">Select destination type</option>
							<option value="category">category</option>
							<option value="collection">collection</option>
							<option value="product">product</option>
							<option value="website">website</option>
						</Input>
					</FormGroup>
					<FormGroup>
						<Label>Destination</Label>
						{this.renderDestinationInput()}
					</FormGroup>
					<FormGroup>
						<Label>Background color</Label>
						<Input type="text"
							name="backgroundColor"
							value={backgroundColor}
							onChange={this.onChange}
							placeholder="Enter background color"
						/>
						<Input type="color"
							name="backgroundColor"
							value={backgroundColor}
							onChange={this.onChange}
						/>
					</FormGroup>
					<FormGroup className="text-center">
						{action === 'delete'
							? (
								<Button
									type='button'
									color='danger'
									onClick={onAction}
								>
									<i className='fa fa-trash' />
								</Button>
							)
							: (
								<Button
									type='button'
									color='secondary'
									onClick={() => {
										const now = new Date();
										onAction({ ...this.state, id: now.getTime().toString() });
										this.setState({ ...this.INITIAL_STATE });
									}}
								>
									<i className='fa fa-plus' />
								</Button>
							)
						}
					</FormGroup>
				</CardBody>
			</Card>
		);
	}
}
