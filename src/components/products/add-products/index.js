//TODO add logic for checking if slug entered is unique or not.
//TODO isInvalid check not working
import React, { Component } from 'react';
import { withFirebase } from '../../../firebase';
import BasicInfoForm from './basic-info';
import ClothingForm from './clothing-form';

const INITIAL_STATE = {
	product: {
		title: "",
		gender: "",
		description: "",
		category: "",
		category_sku: "",
		slug: "",
		supplier: "",
		listPrice: "",
		salePrice: "",
		saleEndDate: "",
		isActive: true,
		type: "",
	},
	categories: [],
	suppliers: [],
	isActive: true,
	loadingCategories: false,
	loadingSuppliers: false,
	error: null
};

const addProduct = (product, firebase) => {
	return firebase.products().add({ ...product });
}

class AddProductBase extends Component {
	constructor(props) {
		super(props);

		this.state = { ...INITIAL_STATE };
	}

	componentDidMount() {
		this.setState({ loadingCategories: true, loadingSuppliers: true });

		this.getCategories = this.props.firebase
			.categories()
			.onSnapshot(snapshot => {
				let categories = [];

				snapshot.forEach(doc =>
					categories.push({ ...doc.data(), cid: doc.id }),
				);

				this.setState({
					categories,
					loadingCategories: false,
				});
			});
		this.getSuppliers = this.props.firebase
			.suppliers()
			.onSnapshot(snapshot => {
				let suppliers = [];

				snapshot.forEach(doc =>
					suppliers.push({ ...doc.data(), sid: doc.id }),
				);

				this.setState({
					suppliers,
					loadingSuppliers: false,
				});
			});
	}

	componentWillUnmount() {
		this.getCategories();
		this.getSuppliers();
	}

	onChange = event => {
		let product = { ...this.state.product };
		product[`${event.target.name}`] = event.target.value;
		this.setState({ product });
	}

	onChangeCategory = event => {
		let cat = this.state.categories.find(category => category.cid === event.target.value);
		let product = { ...this.state.product };
		product["category"] = cat.cid;
		product["category_sku"] = cat.sku;
		this.setState({ product });
	}

	onChangeCheckbox = event => {
		let product = { ...this.state.product };
		product[`$event.target.name`] = event.target.checked;
		this.setState({ product });
	}

	getForm = type => {
		switch (type) {
			case 'clothing':
				return <ClothingForm product={this.state.product} suppliers={this.state.suppliers} />;
			default:
				return null;
		}
	}


	render() {

		const { product, categories, suppliers, loadingCategories, loadingSuppliers, error } = this.state;

		const isInvalid = product.type === "" || product.title === "" || product.category === "" || product.supplier === "" || product.slug === "" || product.listPrice === "" || product.sku === "" || product.gender === "";

		return (
			<div>
				<div className="admn_pnl-secondary_heading">
					<h2>Add product</h2>
				</div>
				{(loadingCategories || loadingSuppliers)
					? <div>Loading ...</div>
					: <div>
						<BasicInfoForm onChange={this.onChange}
							onChangeCategory={this.onChangeCategory}
							onChangeCheckbox={this.onChangeCheckbox}
							product={product}
							categories={categories}
							suppliers={suppliers}
							inInvalid={isInvalid}
						/>
						{this.getForm(product.type)}	
					</div>
				}
			</div>
		)

	}
}

const AddProductItem = withFirebase(AddProductBase);

export { AddProductItem, addProduct };
