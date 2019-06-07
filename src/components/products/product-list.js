import React, { Component } from 'react';
import { withFirebase } from '../../firebase';
import { adminRoutes as ROUTES } from '../../constants/routes';
import { Link } from 'react-router-dom';

const DeleteProduct = ({ pid, firebase }) => (
	<button type="button"
		onClick={() => {
			let isConfirmed = window.confirm('Are you sure you want to delete this product?');
			if (isConfirmed) {
				firebase.product(pid).delete();
			}
		}}
	>
		Delete
  	</button>
);

class ProductListBase extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false, products: [],
		}
	}

	componentDidMount() {
		this.setState({ loading: true });

		this.unsubscribe = this.props.firebase
			.products()
			.onSnapshot(snapshot => {
				let products = [];

				snapshot.forEach(doc =>
					products.push({ ...doc.data(), pid: doc.id }),
				);

				this.setState({
					products,
					loading: false,
				});
			});
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	render() {
		const { loading, products } = this.state;
		return (
			<div>
				<div className="admn_pnl-secondary_heading">
					<h2>Products</h2>
					<Link to={ROUTES.ADD_PRODUCT.path}>
						<button>Add product</button>
					</Link>
				</div>
				{loading && <div>Loading ...</div>}
				<table className="admn_pnl-table">
					<thead>
						<tr>
							<th>#</th>
							<th>Product ID</th>
							<th>Title</th>
							<th>Gender</th>
							<th>Description</th>
							<th>Category</th>
							<th>Supplier</th>
							<th>Slug</th>
							<th>Attributes</th>
							<th>isActive</th>
							<th>List Price</th>
							<th>Sale Price</th>
							<th>Sale End Date</th>
							<th>Action 1</th>
							<th>Action 2</th>
						</tr>
					</thead>
					<tbody>
						{products.map((product, idx) => (
							<tr key={product.pid}>
								<td>{idx + 1}</td>
								<td>{product.pid}</td>
								<td>{product.title}</td>
								<td>{product.gender}</td>
								<td>{product.description}</td>
								<td>{product.category}</td>
								<td
									dangerouslySetInnerHTML={{
										__html: '<pre>' + JSON.stringify(product.supplier, null, 2) + '</pre>'
									}}
								/>
								<td>{product.slug}</td>
								<td
									dangerouslySetInnerHTML={{
										__html: '<pre>' + JSON.stringify(product.attributes, null, 2) + '</pre>'
									}}
								/>
								<td>{product.isActive ? 'yes' : 'no'}</td>
								<td>{product.listPrice}</td>
								<td>{product.salePrice}</td>
								<td>{product.saleEndDate}</td>
								<td><Link to={{ pathname: `${ROUTES.PRODUCT_LIST.path}/${product.pid}/edit`, state: { product } }}>Edit product</Link></td>
								<td><DeleteProduct pid={product.pid} firebase={this.props.firebase} /></td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}
}

const ProductList = withFirebase(ProductListBase);

export { ProductList };
