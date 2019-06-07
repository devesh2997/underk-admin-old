import React, { Component } from 'react';
import { withFirebase } from '../../firebase';
import { adminRoutes as ROUTES } from '../../constants/routes';
import { Link } from 'react-router-dom';
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

const DeleteCategory = ({ cid, firebase }) => (
	<button type="button"
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
		Delete
  	</button>
);

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
			<div>
				<div className="admn_pnl-secondary_heading">
					<h2>Categories</h2>
					<Link to={ROUTES.ADD_CATEGORY_ITEM.path}>
						<button>Add category</button>
					</Link>
					<button onClick={() => deleteAllCategories(this.props.firebase)}>
						Delete all categories
					</button>
					<button onClick={() => insertDemoCategories(this.props.firebase)}>
						Insert demo categories
					</button>
				</div>
				{loading && <div>Loading ...</div>}
				<table className="admn_pnl-table">
					<thead>
						<tr>
							<th>#</th>
							<th>Category ID</th>
							<th>Name</th>
							<th>Slug</th>
							<th>SKU</th>
							<th>Parent</th>
							<th>Ancestors</th>
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
									<DeleteCategory cid={category.cid} firebase={this.props.firebase} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}
}

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
			<div>
				<div className="admn_pnl-secondary_heading">
					<h2>Category ({this.props.match.params.cid})</h2>
				</div>
				{loading && <div>Loading ...</div>}
				{category && (
					<table className="admn_pnl-table">
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
							<tr>
								<th scope="row">Action</th>
								<td><DeleteCategory cid={category.cid} firebase={this.props.firebase} /></td>
							</tr>
						</tbody>
					</table>
				)}
			</div>
		);
	}
}

const INITIAL_STATE = {
	cid: "",
	name: "",
	parent: "",
	slug: "",
	sku: "",
	ancestors: [],
	categories: [],
	loading: false,
	error: null
};

const addCategory = (cid, name, parent, slug, sku, categories, firebase) => {
	let ancestors = [];
	let parent_category = categories.find(category => category.cid === parent);
	if (parent_category) {
		ancestors = parent_category.ancestors;
		const { cid, slug, name } = parent_category;
		ancestors.push({
			cid,
			name,
			slug
		});
	}

	return firebase.category(cid).set({
		name,
		parent,
		slug,
		sku,
		ancestors
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
		const { cid, name, parent, slug, sku, categories } = this.state;


		addCategory(cid, name, parent, slug, sku, categories, this.props.firebase).then((value) => {
			this.setState({ ...INITIAL_STATE });
			this.props.history.push(ROUTES.CATEGORY_LIST.path);
		})
			.catch(error => {
				this.setState({ error });
			});
		event.preventDefault();
	}

	onChange = event => {
		this.setState({ [event.target.name]: event.target.value });
	}

	render() {
		const { cid, name, parent, slug, sku, error, loading, categories } = this.state;

		const isInvalid = cid === "" || name === "" || parent == cid || sku === "";

		return (
			<div>
				<div className="admn_pnl-secondary_heading">
					<h2>Add category</h2>
				</div>
				{loading 
					? <div>Loading ...</div>
					: <form onSubmit={this.onSubmit} className="admn_pnl-form">
						<div>
							<label>Category ID</label>
							<input
								name="cid"
								value={cid}
								onChange={this.onChange}
								type="text"
								placeholder="Category ID"
							/>
						</div>
						<div>
							<label>Name / Title</label>
							<input
								name="name"
								value={name}
								onChange={this.onChange}
								type="text"
								placeholder="Name / Title"
							/>
						</div>
						<div>
							<label>Parent category</label>
							<select name="parent" value={parent} onChange={this.onChange}>
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
							</select>
						</div>
						<div>
							<label>Slug (URL)</label>
							<input
								name="slug"
								value={slug}
								onChange={this.onChange}
								type="text"
								placeholder="Slug (URL)"
							/>
						</div>
						<div>
							<label>SKU</label>
							<input
								name="sku"
								value={sku}
								onChange={this.onChange}
								type="text"
								placeholder="SKU"
							/>
						</div>

						<button disabled={isInvalid} type="submit" className="admn_pnl-button">
							Submit
						</button>

						{error && <p>{error.message}</p>}
					</form>
				}
			</div>
		)
	}
}


const CategoryList = withFirebase(CategoryListBase);
const CategoryItem = withFirebase(CategoryItemBase);
const AddCategoryItem = withFirebase(AddCategoryItemBase);

export { CategoryList, CategoryItem, AddCategoryItem, addCategory };
