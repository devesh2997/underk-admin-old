import React, { Component } from 'react';
import { Badge,Button, Card, CardBody, CardHeader, Table, Row, Col } from 'reactstrap';
import { withFirebase } from '../../firebase';
import { DeleteProduct, VariantModal, InventoryModal } from './product-card';
import { Link } from 'react-router-dom';
import ROUTES from '../../routes';

class ProductItemBase extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			product: {},
			inventory: [],
			isVariantModalOpen: false,
			isInventoryModalOpen: false,
			...props.location.state
		};
	}

	componentDidMount() {
		if (this.state.product.title) {
			return;
		}

		this.setState({ loading: true });

		this.unsubscribe = this.props.firebase
			.product(this.props.match.params.pid)
			.onSnapshot(snapshot => {
				this.setState({
					product: snapshot.data(),
					loading: false,
				});
			});

		this.props.firebase.inventoryOfProduct(this.props.match.params.pid).get()
			.then(doc => {
				if(doc.exists) {
					let inventory = doc.data();
					inventory = Object.keys(inventory).map(sku => ({ ...inventory[sku], sku }));
					this.setState({ inventory });
				}
			});
	}

	toggleVariantModal = () => {
		this.setState((prevState) => ({ isVariantModalOpen: !prevState.isVariantModalOpen }));
	}

	toggleInventoryModal = () => {
		this.setState((prevState) => ({ isInventoryModalOpen: !prevState.isInventoryModalOpen }));
	}

	componentWillUnmount() {
		this.unsubscribe && this.unsubscribe();
	}

	render() {
		const { product, loading } = this.state;

		return (
			<Card>
				<CardHeader>
					<Row>
						<Col md={6}>
							<h4>Product ({this.props.match.params.pid})</h4>
						</Col>
						<Col md={6} className="text-right">
							<Button
								type='button'
								color='primary'
								style={{ margin: '0 3px' }}
								onClick={() => this.toggleVariantModal()}
							>
								Show Variants
							</Button>
							<Button
								type='button'
								color='info'
								style={{ margin: '0 3px' }}
								onClick={() => this.toggleInventoryModal()}
							>
								Show Inventory
							</Button>
							<Link
								to={{
									pathname: `${ROUTES.PRODUCT_LIST.path}/${product.pid}/edit`,
									state: { product }
								}}
							>
								<Button type='button' color='secondary' style={{ margin: '0 3px' }}>
									<i className='fa fa-pencil' />
								</Button>
							</Link>
							<DeleteProduct
								pid={this.props.match.params.pid}
								firebase={this.props.firebase}
								style={{ margin: '0 3px' }}
							/>
						</Col>
					</Row>
				</CardHeader>
				<CardBody>
					{loading && <div className="animated fadeIn pt-3 text-center">Loading...</div>}
					{product.title && (
						<div>
							<Row style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
								{Object.keys(product.assets).map(sku => (
									<img
										src={product.assets[sku].downloadURL}
										width={125}
										alt={sku}
										style={{ margin: 3 }}
									/>
								))}
							</Row>
							<Table striped responsive>
								<tbody>
									<tr>
										<th scope="row">Title</th>
										<td>{product.title}</td>
									</tr>
									<tr>
										<th scope="row">Slug</th>
										<td>{product.slug}</td>
									</tr>
									<tr>
										<th scope="row">isActive</th>
										<td>{JSON.stringify(product.isActive)}</td>
									</tr>
									<tr>
										<th scope="row">Gender</th>
										<td>{product.gender}</td>
									</tr>
									<tr>
										<th scope="row">Category</th>
										<td>{product.category.name + ' (' + product.category.cid + ')'}</td>
									</tr>
									<tr>
										<th scope="row">Collections</th>
										<td>{product.collections.join(', ')}</td>
									</tr>
									<tr>
										<th scope="row">Supplier</th>
										<td>{product.supplier_id}</td>
									</tr>
									<tr>
										<th scope="row">List Price</th>
										<td>{product.listPrice}</td>
									</tr>
									<tr>
										<th scope="row">Discount</th>
										<td>{product.discount}</td>
									</tr>
									<tr>
										<th scope="row">Tax Percent</th>
										<td>{product.taxPercent + (product.isInclusiveTax ? ' (included)' : ' (not included)')}</td>
									</tr>
									<tr>
										<th scope="row">Type</th>
										<td>{product.type}</td>
									</tr>
									<tr>
										<th scope="row">SubType</th>
										<td>{product.attributes.subtype}</td>
									</tr>
									<tr>
										<th scope="row">Color</th>
										<td>
											<span
												className="color-icon"
												style={{ backgroundColor: product.attributes.color.hexcode }}
											/>
											{product.attributes.color.name}
										</td>
									</tr>
									<tr>
										<th scope="row">Style</th>
										<td>{product.attributes.style.name}</td>
									</tr>
									<tr>
										<th scope="row">Design</th>
										<td>{product.attributes.design.name}</td>
									</tr>
									<tr>
										<th scope="row">Options (based_on: {product.options.based_on})</th>
										<td>
											{this.state.inventory.map(option => (
												<Badge
													color={option.stock > 0 ? 'success' : 'danger'}
													style={{ margin: '0 3px' }}
												>
													{option.name}
												</Badge>
											))}
										</td>
									</tr>
									<tr>
										<th scope="row">Description</th>
										<td><pre>{JSON.stringify(product.description, null, 2)}</pre></td>
									</tr>
								</tbody>
							</Table>
						</div>
					)}
				</CardBody>
				<VariantModal
					isOpen={this.state.isVariantModalOpen}
					toggle={this.toggleVariantModal}
					pid={this.props.match.params.pid}
					firebase={this.props.firebase}
				/>
				<InventoryModal
					isOpen={this.state.isInventoryModalOpen}
					toggle={this.toggleInventoryModal}
					pid={this.props.match.params.pid}
					inventory={this.state.inventory}
				/>
			</Card>
		);
	}
}

const ProductItem = withFirebase(ProductItemBase);
export default ProductItem
