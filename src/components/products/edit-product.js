import React, { Component } from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';
import BasicInfoForm from './forms/basic-info';
import ClothingForm from './forms/clothing';
import { withFirebase } from '../../firebase';

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
	loadingProductDetails: false,
	loadingCategories: false,
	loadingSuppliers: false,
};

class EditProductBase extends Component {
	constructor(props) {
		super(props);

		let mappedState = {};
		if(props.location.state) {
			mappedState = { ...props.location.state };
			mappedState.product.category = mappedState.product.category.cid;
			delete mappedState.product.pid;
		}

		this.state = {
			...INITIAL_STATE,
			...mappedState
		};
	}

	componentDidMount() {
		this.setState({ loadingCategories: true, loadingSuppliers: true });

		if(!this.props.location.state) {
			this.setState({ loadingProductDetails: true });
			this.props.firebase
			.product(this.props.match.params.pid)
			.get()
			.then(doc => {
				let product = doc.data();
				product.category = product.category.cid;

				this.setState({
					product,
					loadingProductDetails: false,
				});
			});
		}

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

	updateProduct = (product, firebase) => {
		return firebase.product(this.props.match.params.pid).set(product);
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
					handleSubmit={this.updateProduct}
				/>;
			default:
				return null;
		}
	}


	render() {
		const { loadingProductDetails, loadingCategories, loadingSuppliers } = this.state;
		const { product, categories, suppliers } = this.state;

		const isInvalid = product.type === '' || product.title === '' || product.category === '' || product.supplier_id === '' || product.slug === '' || product.listPrice === '' || product.sku === '' || product.gender === '';

		return (
			<Card>
				<CardHeader>
					<h4>Edit product ({this.props.match.params.pid})</h4>
				</CardHeader>
				<CardBody>
					{(loadingProductDetails || loadingCategories || loadingSuppliers)
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
						</div>
					}
				</CardBody>
			</Card>
		)

	}
}

export default withFirebase(EditProductBase);
