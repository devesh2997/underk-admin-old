import React from 'react';
import {
	Row,
	Button,
	Badge,
	Modal,
	ModalHeader,
	ModalBody,
	Table
} from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from '../../routes';
import { withFirebase } from '../../firebase';

const siteURL = "https://master.dnznxvwoj6gri.amplifyapp.com";

export const DeleteProduct = ({ pid, firebase, style }) => (
	<Button
		type='button'
		color='danger'
		style={{ margin: 5, ...style }}
		onClick={() => {
			let isConfirmed = window.confirm(
				'Are you sure you want to delete this product?'
			);
			if (isConfirmed) {
				firebase.product(pid).delete();
			}
		}}
	>
		<i className='fa fa-trash' />
	</Button>
);

export class VariantModal extends React.Component {
	constructor (props) {
	  super(props)

	  this.state = {
		variants: [],
		loadingVariants: false
	  }
	}

	componentDidMount() {
		this.setState({ loadingVariants: true })

		this.props.firebase
		  .productVariants(this.props.pid)
		  .get()
		  .then(snapshot => {
			let variants = []
			snapshot.forEach(doc => {
			  variants.push(doc.data())
			})

			this.setState({
			  variants,
			  loadingVariants: false
			})
		  })
	}

	render () {
	  const { variants, loadingVariants } = this.state

	  return (
		<Modal
		  isOpen={this.props.isOpen}
		  centered
		  size='lg'
		  toggle={this.props.toggle}
		>
		  <ModalHeader
			close={
			  <button className='close' onClick={this.props.toggle}>
				&times;
			  </button>
			}
		  >
			Variants of Product ({this.props.pid})
		  </ModalHeader>
		  <ModalBody>
			{loadingVariants && (
			  <div className='animated fadeIn pt-3 text-center'>Loading...</div>
			)}
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
						__html:
						  '<pre>' +
						  JSON.stringify(variant.value, null, 2) +
						  '</pre>'
					  }}
					/>
				  </tr>
				))}
			  </tbody>
			</Table>
		  </ModalBody>
		</Modal>
	  )
	}
}

export const InventoryModal = (props) => {
	return (
		<Modal
		  isOpen={props.isOpen}
		  centered
		  size='lg'
		  toggle={props.toggle}
		>
		  <ModalHeader
			close={
			  <button className='close' onClick={props.toggle}>
				&times;
			  </button>
			}
		  >
			Product Inventory ({props.pid})
		  </ModalHeader>
		  <ModalBody>
			<Table striped responsive>
			  <thead>
				<tr>
				  <th>#</th>
				  <th>SKU</th>
				  <th>Name</th>
				  <th>Stock</th>
				  <th>Reserved</th>
				</tr>
			  </thead>
			  <tbody>
				{props.inventory.map((option, idx) => (
				  <tr key={option.sku}>
					<td>{idx + 1}</td>
					<td>{option.sku}</td>
					<td>{option.name}</td>
					<td>{option.stock}</td>
					<td>{option.reserved}</td>
				  </tr>
				))}
			  </tbody>
			</Table>
		  </ModalBody>
		</Modal>
	)
}

class ProductCard extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			inventory: [],
			isVariantModalOpen: false,
			isInventoryModalOpen: false
		};
	}

	componentDidMount() {
		this.props.firebase.inventoryOfProduct(this.props.product.pid).get()
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

	render() {
		const { product } = this.props;
		const prdThumb = product.assets[Object.keys(product.assets)[0]];

		return (
			<div className="prd-card">
				<Row className="align-items-center">
					<div className="thumb">
						<img src={prdThumb.downloadURL} className="img-fluid" alt={prdThumb.name} />
					</div>
					<div className="content">
						<div>
							<strong>
								<Link to={`${siteURL}/p/${product.slug}`}>
									{product.title}
								</Link>
								&nbsp; ({product.gender})
							</strong>
						</div>
						<div>
							<strong>
								<Link to={`${siteURL}/${product.category.slug}`}>
									{product.category.name}
								</Link>
							</strong>
						</div>
						<div>
							<div>List Price: <strong>{product.listPrice}</strong></div>
							<div>Discount: <strong>{product.discount}</strong></div>
							<div>Tax Percent: <strong>{product.taxPercent} ({product.isInclusiveTax ? 'included' : 'not included'})</strong></div>
							<div>
								<Link to="#" onClick={this.toggleInventoryModal}><strong>Inventory</strong></Link>:
								&nbsp;
								{this.state.inventory.map(option => (
									<Badge
										color={option.stock > 0 ? 'success' : 'danger'}
										style={{ margin: '0 3px' }}
									>
										{option.name}
									</Badge>
								))}
							</div>
						</div>
						<div>
							<Button
								type='button'
								color='primary'
								style={{ margin: 5 }}
								onClick={() => this.toggleVariantModal()}
							>
								<i className='fa fa-arrows' />
							</Button>
							<Link
								to={{
									pathname: `${ROUTES.PRODUCT_LIST.path}/${product.pid}/edit`,
									state: { product }
								}}
							>
								<Button type='button' color='secondary' style={{ margin: 5 }}>
									<i className='fa fa-pencil' />
								</Button>
							</Link>
							<DeleteProduct
								pid={product.pid}
								firebase={this.props.firebase}
							/>
							<Link
								to={{
									pathname: `${ROUTES.PRODUCT_LIST.path}/${product.pid}`,
									state: { product }
								}}
							>
								<Button type='button' color='info' style={{ margin: 5 }}>
									<i className='fa fa-ellipsis-h' />
								</Button>
							</Link>
						</div>
					</div>
				</Row>
				<VariantModal
					isOpen={this.state.isVariantModalOpen}
					toggle={this.toggleVariantModal}
					pid={product.pid}
					firebase={this.props.firebase}
				/>
				<InventoryModal
					isOpen={this.state.isInventoryModalOpen}
					toggle={this.toggleInventoryModal}
					pid={product.pid}
					inventory={this.state.inventory}
				/>
			</div>
		);
	}
}

export default withFirebase(ProductCard);
