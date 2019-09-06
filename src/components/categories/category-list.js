import React, { Component } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Row, Table } from 'reactstrap';
import { withFirebase } from '../../firebase';
import { insertDemoCategories } from './utils.js';

const deleteCategory = (cid, firebase) => {
	firebase.category(cid).delete().then(() => {
		firebase.categories().where("parent", "==", cid)
			.onSnapshot(snapshot => {
				snapshot.forEach(doc =>
					deleteCategory(doc.id, firebase));
			});
	});
};

const DeleteCategory = ({ cid, firebase }) => (
	<Button type="button"
		color="danger"
		onClick={() => {
			let isConfirmed = window.confirm(
				'Are you sure you want to delete this category?' + '\n'
				+ 'Children categories associated with it will automatically be deleted.'
			);
			if(isConfirmed) {
				deleteCategory(cid, firebase);
			}
		}}
	>
		<i className="fa fa-trash"></i>
  	</Button>
);

const deleteAllCategories = (firebase) => {
	let isConfirmed = window.confirm('Are you sure you want to delete all categories?');
	if(isConfirmed) {
		firebase.categories().where("parent", "==", "")
			.onSnapshot(snapshot => {
				snapshot.forEach(doc =>
					deleteCategory(doc.id, firebase));
			});
	}
};



class CategoryListBase extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false, categories: [],
		}
	}

	componentDidMount() {
		this.setState({ loading: true });

		this.unsubscribe = this.props.firebase
			.categories()
			.onSnapshot(snapshot => {
				let categories = [];

				snapshot.forEach(doc =>
					categories.push({ ...doc.data(), cid: doc.id }),
				);

				this.setState({
					categories,
					loading: false,
				});
			});
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	render() {
		const { categories, loading } = this.state;

		return (
			<Card>
				<CardHeader>
					<Row>
						<Col md="6">
							<h4>Categories</h4>
						</Col>
						<Col md="6" className="text-right">
							<Button type="button"
								color="secondary"
								onClick={() => insertDemoCategories(this.props.firebase)}
								style={{ margin: '5px 10px' }}
							>
								Insert demo categories
							</Button>
							<Button type="button"
								color="danger"
								onClick={() => deleteAllCategories(this.props.firebase)}
								style={{ margin: '5px 10px' }}
							>
								Delete all categories
							</Button>
						</Col>
					</Row>
				</CardHeader>
				<CardBody>
					{loading && <div className="animated fadeIn pt-3 text-center">Loading...</div>}
					<Table striped responsive>
						<thead>
							<tr>
								<th>#</th>
								<th>Category ID</th>
								<th>Name</th>
								<th>Slug</th>
								<th>SKU</th>
								<th>Parent</th>
								<th>Ancestors</th>
								<th>Slug Family</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{categories.map((category, idx) => (
								<tr key={category.cid}>
									<td>{idx+1}</td>
									<td>{category.cid}</td>
									<td>{category.name}</td>
									<td>{category.slug}</td>
									<td>{category.sku}</td>
									<td>{category.parent}</td>
									<td>
										{category.ancestors.map(ancestor => (
											<span key={ancestor.cid}>{" > " + ancestor.name}</span>
										))}
									</td>
									<td>
									{category.slugFamily.map(slug => (
											<span key={slug}>{" , " + slug}</span>
										))}
									</td>
									<td>
										<DeleteCategory cid={category.cid} firebase={this.props.firebase} />
									</td>
								</tr>
							))}
						</tbody>
					</Table>
				</CardBody>
			</Card>
		);
	}
}

export default withFirebase(CategoryListBase);
