//TODO add logic for checking if slug entered is unique or not.
import React, { Component } from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';
import BasicInfoForm from './forms/basic-info';
import ClothingForm from './forms/clothing';
import { withFirebase } from '../../firebase';
import AssetsUploader from './add-assets';

const INITIAL_STATE = {
	product: {
		title: '',
		gender: '',
		description: '',
		category: '',
		slug: '',
		supplier_id: '',
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
};

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

	addProduct = (product, firebase) => {
		return firebase.products().add(product);
	}

	onChange = event => {
		let { product } = this.state;
		product[event.target.name] = event.target.value;
		this.setState({ product });
	}

	onCheckboxChange = event => {
		let { product } = this.state;
		product[event.target.name] = event.target.checked;
		this.setState({ product });
	}

	getForm = (isProductInvalid) => {
		const { product, categories, suppliers } = this.state;

		switch (product.type) {
			case 'clothing':
				return <ClothingForm
					product={product}
					isProductInvalid={isProductInvalid}
					categories={categories}
					suppliers={suppliers}
					handleSubmit={this.addProduct}
				/>;
			default:
				return null;
		}
	}


	render() {
		const { loadingCategories, loadingSuppliers } = this.state;
		const { product, categories, suppliers } = this.state;

		const isInvalid = product.type === '' || product.title === '' || product.category === '' || product.supplier_id === '' || product.slug === '' || product.listPrice === '' || product.sku === '' || product.gender === '';

		return (
			<Card>
				<CardHeader>
					<h4>Add product</h4>
				</CardHeader>
				<CardBody>
					{(loadingCategories || loadingSuppliers)
						? <div className="animated fadeIn pt-3 text-center">Loading...</div>
						: <div>
							<BasicInfoForm
								product={product}
								categories={categories}
								suppliers={suppliers}
								onChange={this.onChange}
								onCheckboxChange={this.onCheckboxChange}
							/>
							{this.getForm(isInvalid)}
							<AssetsUploader />
						</div>
					}
				</CardBody>
			</Card>
		)

	}
}

export default withFirebase(AddProductBase);
