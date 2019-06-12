import React, { Component } from 'react';
import { Button, Card, CardBody, CardHeader, Modal, ModalHeader, ModalBody, Table } from 'reactstrap';
import { withFirebase } from '../../firebase';
import ROUTES from '../../routes';
import { Link } from 'react-router-dom';

const DeleteProduct = ({ pid, firebase }) => (
	<Button type="button"
		color="danger"
		onClick={() => {
			let isConfirmed = window.confirm('Are you sure you want to delete this product?');
			if (isConfirmed) {
				firebase.product(pid).delete();
			}
		}}
	>
		<i className="fa fa-trash"></i>
  	</Button>
);

class VariantModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			variants: [],
			loadingVariants: false
		}
	}

	componentDidUpdate(prevProps) {
		if(prevProps.product_id !== this.props.product_id && this.props.product_id) {
			this.setState({ loadingVariants: true });

			this.unsubscribe = this.props.firebase
				.productVariants(this.props.product_id)
				.onSnapshot(snapshot => {
					let variants = [];
					snapshot.forEach(doc => {
						variants.push(doc.data());
					});

					this.setState({
						variants,
						loadingVariants: false
					});
				});
		}
	}

	onClosed = () => {
		this.setState({ variants: [] });
		this.unsubscribe && this.unsubscribe();
	}

	render() {
		const { variants, loadingVariants } = this.state;

		return (
			<Modal
				isOpen={this.props.isOpen}
				centered={true}
				size="lg"
				toggle={this.props.toggle}
				onClosed={this.onClosed}
			>
				<ModalHeader
					close={<button className="close" onClick={this.props.toggle}>&times;</button>}
				>
					Variants of Product ({this.props.product_id})
				</ModalHeader>
				<ModalBody>
					{loadingVariants && <div className="animated fadeIn pt-3 text-center">Loading...</div>}
					<Table striped responsive>
						<thead>
							<tr>
								<th>#</th>
								<th>Product ID</th>
								<th>Slug</th>
								<th>Type</th>
								<th>Value</th>
							</tr>
						</thead>
						<tbody>
							{variants.map((variant, idx) => (
								<tr key={variant.pid}>
									<td>{idx + 1}</td>
									<td>{variant.pid}</td>
									<td>{variant.slug}</td>
									<td>{variant.type}</td>
									<td
										dangerouslySetInnerHTML={{
											__html: '<pre>' + JSON.stringify(variant.value, null, 2) + '</pre>'
										}}
									/>
								</tr>
							))}
						</tbody>
					</Table>
				</ModalBody>
			</Modal>
		);
	}
}

class ProductListBase extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			products: [],
			selectedProductId: '',
			isVariantModalOpen: false,
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

	toggleVariantModal = () => {
		this.setState(prevState => ({ isVariantModalOpen: !prevState.isVariantModalOpen }));
	}

	render() {
		const { loading, products, isVariantModalOpen, selectedProductId } = this.state;

		return (
			<Card>
				<VariantModal
					isOpen={isVariantModalOpen}
					toggle={this.toggleVariantModal}
					product_id={selectedProductId}
					firebase={this.props.firebase}
				/>
				<CardHeader>
					<h4>Products</h4>
				</CardHeader>
				<CardBody>
					{loading && <div className="animated fadeIn pt-3 text-center">Loading...</div>}
					<Table striped responsive>
						<thead>
							<tr>
								<th>#</th>
								<th>Product ID</th>
								<th>Title</th>
								<th>Gender</th>
								<th>Description</th>
								<th>Category</th>
								<th>Supplier ID</th>
								<th>Slug</th>
								<th>Attributes</th>
								<th>Assets</th>
								<th>isActive</th>
								<th>List Price</th>
								<th>Sale Price</th>
								<th>Sale End Date</th>
								<th>Show Variants</th>
								<th>Edit</th>
								<th>Delete</th>
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
									<td
										dangerouslySetInnerHTML={{
											__html: '<pre>' + JSON.stringify(product.category, null, 2) + '</pre>'
										}}
									/>
									<td>{product.supplier_id}</td>
									<td>{product.slug}</td>
									<td
										dangerouslySetInnerHTML={{
											__html: '<pre>' + JSON.stringify(product.attributes, null, 2) + '</pre>'
										}}
									/>
									<td
										dangerouslySetInnerHTML={{
											__html: '<pre>' + JSON.stringify(product.assets, null, 2) + '</pre>'
										}}
									/>
									<td>{product.isActive ? 'Yes' : 'No'}</td>
									<td>{product.listPrice}</td>
									<td>{product.salePrice}</td>
									<td>{product.saleEndDate}</td>
									<td>
										<Button type="button"
											color="primary"
											onClick={() => {
												this.setState({ selectedProductId: product.pid });
												this.toggleVariantModal();
											}}
										>
											<i className="fa fa-arrows"></i>
										</Button>
									</td>
									<td>
										<Link to={{
											pathname: `${ROUTES.PRODUCT_LIST.path}/${product.pid}/edit`,
											state: { product }
										}}>
											<Button type="button" color="secondary">
												<i className="fa fa-pencil"></i>
											</Button>
										</Link>
									</td>
									<td><DeleteProduct pid={product.pid} firebase={this.props.firebase} /></td>
								</tr>
							))}
						</tbody>
					</Table>
				</CardBody>
			</Card>
		);
	}
}

export default withFirebase(ProductListBase);
