//TODO add logic for checking if slug entered is unique or not.
//TODO isInvalid check not working
import React, { Component } from 'react';
import { withFirebase } from '../../firebase';
import BasicInfoForm from './forms/basic-info';
import ClothingForm from './forms/clothing';

const INITIAL_STATE = {
	product: {
		title: '',
		gender: '',
		description: '',
		category: '',
		category_sku: '',
		slug: '',
		supplier: '',
		listPrice: '',
		salePrice: '',
		saleEndDate: '',
		isActive: true,
		type: '',
	},
	categories: [],
	suppliers: [],
	loadingCategories: false,
	loadingSuppliers: false,
	error: ''
};

const addProduct = (product, firebase) => {
	return firebase.products().add(product);
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
		this.setState(prevState => {
			let product = prevState.product;
			product[event.target.name] = event.target.value;
			return { product };
		});
	}

	onCategoryChange = event => {
		let cat = this.state.categories.find(category => category.cid === event.target.value);
		this.setState(prevState => {
			let product = prevState.product;
			product['category'] = cat.cid;
			product['category_sku'] = cat.sku;
			return { product };
		});
	}

	onCheckboxChange = event => {
		this.setState(prevState => {
			let product = prevState.product;
			product[event.target.name] = event.target.checked;
			return { product };
		});
	}

	getForm = (isProductInvalid) => {
		const { product, suppliers } = this.state;

		switch (product.type) {
			case 'clothing':
				return <ClothingForm product={product} isProductInvalid={isProductInvalid} suppliers={suppliers} />;
			default:
				return null;
		}
	}


	render() {
		const { loadingCategories, loadingSuppliers, error } = this.state;
		const { product, categories, suppliers } = this.state;

		const isInvalid = product.type === '' || product.title === '' || product.category === '' || product.supplier === '' || product.slug === '' || product.listPrice === '' || product.sku === '' || product.gender === '';

		return (
			<div>
				<div className="admn_pnl-secondary_heading">
					<h2>Add product</h2>
				</div>
				{(loadingCategories || loadingSuppliers)
					? <div>Loading ...</div>
					: <div>
						<BasicInfoForm
							product={{ ...product, isInvalid }}
							categories={categories}
							suppliers={suppliers}
							onChange={this.onChange}
							onCategoryChange={this.onCategoryChange}
							onCheckboxChange={this.onCheckboxChange}
						/>
						{this.getForm(isInvalid)}	
					</div>
				}
			</div>
		)

	}
}

const AddProductItem = withFirebase(AddProductBase);

export { AddProductItem, addProduct };
