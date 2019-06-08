import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Table } from 'reactstrap';
import { withFirebase } from '../../firebase';

class CategoryItemBase extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			category: null,
			...props.location.state
		};
	}

	componentDidMount() {
		if (this.state.category) {
			return;
		}

		this.setState({ loading: true });

		this.unsubscribe = this.props.firebase
			.category(this.props.match.params.cid)
			.onSnapshot(snapshot => {
				this.setState({
					category: snapshot.data(),
					loading: false,
				});
			});
	}

	componentWillUnmount() {
		this.unsubscribe && this.unsubscribe();
	}

	render() {
		const { category, loading } = this.state;

		return (
			<Card>
				<CardHeader>
					<h4>Category ({this.props.match.params.cid})</h4>
				</CardHeader>
				<CardBody>
					{loading && <div className="animated fadeIn pt-3 text-center">Loading...</div>}
					{category && (
						<Table striped responsive>
							<tbody>
								<tr>
									<th scope="row">Category ID</th>
									<td>{this.props.match.params.cid}</td>
								</tr>
								<tr>
									<th scope="row">Name</th>
									<td>{category.name}</td>
								</tr>
								<tr>
									<th scope="row">Slug</th>
									<td>{category.slug}</td>
								</tr>
								<tr>
									<th scope="row">SKU</th>
									<td>{category.sku}</td>
								</tr>
								<tr>
									<th scope="row">Parent</th>
									<td>{category.parent}</td>
								</tr>
								<tr>
									<th scope="row">Ancestors</th>
									<td>
										{category.ancestors.map(ancestor => (
											<span key={ancestor.cid}>{" > " + ancestor.name}</span>
										))}
									</td>
								</tr>
							</tbody>
						</Table>
					)}
				</CardBody>
			</Card>
		);
	}
}

export default withFirebase(CategoryItemBase);
