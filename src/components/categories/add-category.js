import React, { Component } from 'react';
import { Alert, Button, Card, CardBody, CardHeader, Form, FormGroup, Input, Label } from 'reactstrap';
import { withFirebase } from '../../firebase';
import ROUTES from '../../routes';

const INITIAL_STATE = {
	cid: '',
	name: '',
	parent: '',
	slug: '',
	sku: '',
	ancestors: [],
	categories: [],
	loading: false,
	error: null
};

const addCategory = (cid, name, parent, slug, sku, categories, firebase) => {
	let ancestors = [];
	let slugFamily = [];
	let parent_category = categories.find(category => category.cid === parent);
	if (parent_category) {
		ancestors = parent_category.ancestors;
		slugFamily = parent_category.slugFamily;
		const { cid, slug, name } = parent_category;
		ancestors.push({
			cid,
			name,
			slug
		});
		slugFamily.push(slug);
	}
	slugFamily.push(slug);

	return firebase.category(cid).set({
		name,
		parent,
		slug,
		sku,
		ancestors,
		slugFamily
	});
}

class AddCategoryItemBase extends Component {
	constructor(props) {
		super(props);

		this.state = { ...INITIAL_STATE };
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

	onSubmit = event => {
		event.preventDefault();

		const { cid, name, parent, slug, sku, categories } = this.state;

		addCategory(cid, name, parent, slug, sku, categories, this.props.firebase)
		.then(() => {
			this.props.history.push(ROUTES.CATEGORY_LIST.path);
		})
		.catch(error => {
			this.setState({ error });
		});
	}

	onChange = event => {
		this.setState({ [event.target.name]: event.target.value });
	}

	render() {
		const { cid, name, parent, slug, sku, error, loading, categories } = this.state;

		const isInvalid = cid === '' || name === '' || parent === cid || sku === '';

		return (
			<Card>
				<CardHeader>
					<h4>Add category</h4>
				</CardHeader>
				<CardBody>
					{loading
						? <div className="animated fadeIn pt-3 text-center">Loading...</div>
						: <Form onSubmit={this.onSubmit}>
							<FormGroup>
								<Label>Category ID</Label>
								<Input type="text"
									name="cid"
									value={cid}
									onChange={this.onChange}
									placeholder="Enter category ID"
								/>
							</FormGroup>
							<FormGroup>
								<Label>Name / Title</Label>
								<Input type="text"
									name="name"
									value={name}
									onChange={this.onChange}
									placeholder="Enter name / title"
								/>
							</FormGroup>
							<FormGroup>
								<Label>Parent category</Label>
								<Input type="select" name="parent" value={parent} onChange={this.onChange}>
									<option value="">
										Select parent
									</option>
									{
										categories.map(category => (
											<option key={category.cid} value={category.cid}>
												{category.name}
											</option>
										))
									}
								</Input>
							</FormGroup>
							<FormGroup>
								<Label>Slug (URL)</Label>
								<Input type="text"
									name="slug"
									value={slug}
									onChange={this.onChange}
									placeholder="Enter slug (URL)"
								/>
							</FormGroup>
							<FormGroup>
								<Label>SKU</Label>
								<Input type="text"
									name="sku"
									value={sku}
									onChange={this.onChange}
									placeholder="Enter SKU"
								/>
							</FormGroup>

							<Button type="submit" color="primary" disabled={isInvalid}>
								Submit
							</Button>

							{error && <Alert color="danger">{error.message}</Alert>}
						</Form>
					}
				</CardBody>
			</Card>
		)
	}
}

export default withFirebase(AddCategoryItemBase);
