import React, { Component } from 'react';
import { Button, Card, CardBody, CardHeader, Table } from 'reactstrap';
import { withFirebase } from '../../../firebase';

const clothingAttributes = ['colors', 'designs', 'sizes', 'styles'];

const DeleteAttribute = ({ attributePath, firebase }) => (
	<Button type="button"
		color="danger"
		onClick={() => {
			let isConfirmed = window.confirm('Are you sure you want to delete this attribute?');
			if (isConfirmed) {
				firebase.db.doc(attributePath).delete();
			}
		}}
	>
		<i className="fa fa-trash"></i>
	</Button>
);

class AttributeListBase extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			attributes: {}
		}

		this.subscriptionList = [];
	}

	componentDidMount() {
		this.setState({ loading: true });

		let { attributes } = this.state;

		this.subscriptionList = clothingAttributes.map(attributeType => {
			return this.props.firebase.db.collection('attributes/clothing/' + attributeType)
			.onSnapshot(snapshot => {
				let attributeItems = [];

				snapshot.forEach(doc => {
					attributeItems.push({ ...doc.data(), id: doc.id });
				});

				if (attributes.clothing) {
					attributes.clothing[attributeType] = attributeItems;
				} else {
					attributes.clothing = {
						[attributeType]: attributeItems
					};
				}

				this.setState({
					loading: false,
					attributes
				});
			});
		});
	}

	componentWillUnmount() {
		this.subscriptionList.forEach(unsubscribe => {
			unsubscribe();
		});
	}

	render() {
		const { loading, attributes } = this.state;

		return (
			<Card>
				<CardHeader>
					<h4>Attributes</h4>
				</CardHeader>
				<CardBody>
					{loading && <div className="animated fadeIn pt-3 text-center">Loading...</div>}
					<Table striped responsive>
						<thead>
							<tr>
								<th>For</th>
								<th>Type</th>
								<th>Attribute</th>
								<th>Delete</th>
							</tr>
						</thead>
						<tbody>
							{Object.keys(attributes).map(attributeFor =>
								Object.keys(attributes[attributeFor]).map(attributeType =>
									attributes[attributeFor][attributeType].map(attribute =>
										<tr>
											<td>{attributeFor}</td>
											<td>{attributeType}</td>
											<td
												dangerouslySetInnerHTML={{
													__html: '<pre>' + JSON.stringify(attribute, null, 2) + '</pre>'
												}}
											/>
											<td>
												<DeleteAttribute
													attributePath={'attributes/' + attributeFor + '/' + attributeType + '/' + attribute.id}
													firebase={this.props.firebase}
												/>
											</td>
										</tr>
									)
								)
							)}
						</tbody>
					</Table>
				</CardBody>
			</Card>
		);
	}
}

export default withFirebase(AttributeListBase);
