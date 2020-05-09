import React, { Component } from 'react';
import { Button, Card, CardBody, CardHeader, Form, FormGroup, Input, Label } from 'reactstrap';
// import { withFirebase } from '../../../firebase';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import ROUTES from '../../../routes';

const clothingAttributes = ['colors', 'designs', 'sizes', 'styles'];

class AddAttributeBase extends Component {
	constructor(props) {
		super(props);
		this.state = {
			attributeFor: 'clothing',
			attributeType: '',
			attribute: {}
		}
	}

	handleInputChange = (event) => {
		let { attribute } = this.state;
		attribute[event.target.name] = event.target.value;
		this.setState({ attribute });
	}

	getAttributeForm = () => {
		const { attributeFor } = this.state;

		switch (attributeFor) {
			default:
				return (
					<div>
						<FormGroup>
							<Label>Type</Label>
							<Input type="select"
								name="attributeType"
								onChange={(e) => this.setState({ attributeType: e.target.value, attribute: {} })}
							>
								<option>Select attribute type</option>
								{
									clothingAttributes.map((attributeType, idx) =>
										<option key={idx} value={attributeType}>{attributeType}</option>
									)
								}
							</Input>
						</FormGroup>
						{this.getClothingAttributeForm()}
					</div>
			);
		}
	}

	getClothingAttributeForm = () => {
		const { attributeType, attribute } = this.state;

		switch (attributeType) {
			case 'colors':
				return (
					<div>
						<FormGroup>
							<Label>Hexcode</Label>
							<Input type="text"
								name="hexcode"
								value={attribute.hexcode ? attribute.hexcode : ''}
								onChange={this.handleInputChange}
								placeholder="Enter hexcode"
							/>
						</FormGroup>
						<FormGroup>
							<Label>Name</Label>
							<Input type="text"
								name="name"
								value={attribute.name ? attribute.name : ''}
								onChange={this.handleInputChange}
								placeholder="Enter name"
							/>
						</FormGroup>
						<FormGroup>
							<Label>SKU</Label>
							<Input type="text"
							name="sku"
							value={attribute.sku ? attribute.sku : ''}
							onChange={this.handleInputChange}
							placeholder="Enter sku"
						/>
						</FormGroup>
					</div>
				);
			default:
				return (
					<div>
						<FormGroup>
							<Label>Name</Label>
							<Input type="text"
								name="name"
								value={attribute.name ? attribute.name : ''}
								onChange={this.handleInputChange}
								placeholder="Enter name"
							/>
						</FormGroup>
						<FormGroup>
							<Label>SKU</Label>
							<Input type="text"
								name="sku"
								value={attribute.sku ? attribute.sku : ''}
								onChange={this.handleInputChange}
								placeholder="Enter sku"
							/>
						</FormGroup>
					</div>
				);
		}
	}

	handleSubmit = (event) => {
		event.preventDefault();

		const { attributeFor, attributeType, attribute } = this.state;

		this.props.firebase
		.db.collection('attributes/' + attributeFor + '/' + attributeType)
		.add(attribute)
		.then(() => {
			this.props.history.push(ROUTES.ATTRIBUTE_LIST.path);
		})
		.catch(error => {
			// Handle Error
			console.log(error);
		});
}

	render() {
		const { attributeType, attribute } = this.state;
		const isInvalid = !attributeType || !attribute.name || !attribute.sku;

		return (
			<Card>
				<CardHeader>
					<h4>Add Attribute</h4>
				</CardHeader>
				<CardBody>
					<Form onSubmit={this.handleSubmit}>
						<FormGroup>
							<Label>For</Label>
							<Input type="select"
								name="attributeFor"
								onChange={(e) =>
									this.setState({
										attributeFor: e.target.value,
										attributeType: '',
										attribute: {}
									})
								}
							>
								<option value="clothing">clothing</option>
							</Input>
						</FormGroup>
						{this.getAttributeForm()}
						<FormGroup>
							<Button type="submit" color="primary" disabled={isInvalid}>
								Submit
							</Button>
						</FormGroup>
					</Form>
				</CardBody>
			</Card>
		);
	}
}

// export default compose(
// 	withFirebase,
// 	withRouter
// )(AddAttributeBase);
