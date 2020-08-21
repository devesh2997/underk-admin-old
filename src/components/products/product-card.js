import React from 'react'
import { useState } from 'react'
import {
	Row,
	Button,
	Badge,
	Modal,
	ModalHeader,
	ModalBody,
	Table,
	Input,
	Col
} from 'reactstrap'
import { Link } from 'react-router-dom'
import ROUTES from '../../routes'
import { withFirebase } from '../../firebase'
import Switch from 'react-switch'
import { paiseToRupeeString, useFormInput } from '../../utils'
import { increaseStock, decreaseStock } from '../inventory/utils'

const siteURL = 'https://master.dnznxvwoj6gri.amplifyapp.com'

export const DeleteProduct = ({ pid, firebase, style }) => (
	<Button
		type='button'
		color='danger'
		style={{ margin: 5, ...style }}
		onClick={() => {
			let isConfirmed = window.confirm(
				'Are you sure you want to delete this product?'
			)
			if (isConfirmed) {
				firebase.product(pid).delete()
			}
		}}
	>
		<i className='fa fa-trash' />
	</Button>
)

export class VariantModal extends React.Component {
	constructor (props) {
		super(props)

		this.state = {
			variants: [],
			loadingVariants: false
		}
	}

	componentDidMount () {
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
						<div className='animated fadeIn pt-3 text-center'>
							Loading...
						</div>
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
												JSON.stringify(
													variant.value,
													null,
													2
												) +
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

const StockUpdate = props => {
	const quantity = useFormInput('')
	const supplierId = props.supplier
	const pid = props.pid
	const reason = 'Update inventory from admin panel'

	const [loading, setLoading] = useState(false)

	const stockIncrease = {
		sku: props.sku,
		increase: {
			[supplierId]: quantity.value
		}
	}

	const stockDecrease = {
		sku: props.sku,
		decrease: {
			[supplierId]: quantity.value
		}
	}

	if (loading) return 'Loading'

	return (
		<>
			<Input type='number' {...quantity} min={0} />
			<Button
				type='button'
				color='primary'
				style={{ margin: 5 }}
				onClick={async () => {
					setLoading(true)
					await increaseStock(
						props.firebase.db,
						pid,
						stockIncrease,
						reason
					)
					setLoading(false)
				}}
			>
				<i className='fa fa-plus' />
			</Button>
			<Button
				type='button'
				color='primary'
				style={{ margin: 5 }}
				onClick={async () => {
					setLoading(true)
					await decreaseStock(
						props.firebase.db,
						pid,
						stockDecrease,
						reason
					)
					setLoading(false)
				}}
			>
				<i className='fa fa-minus' />
			</Button>
		</>
	)
}

export const InventoryModal = props => {
	if (props.isOpen) console.log(props)
	const quantity = useFormInput('')
	return (
		<Modal isOpen={props.isOpen} size='lg' toggle={props.toggle}>
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
							<th>Quantity</th>
						</tr>
					</thead>
					<tbody>
						{props.inventory.map((option, idx) =>
							Object.keys(option.inventory).map(i => (
								<tr key={option.sku}>
									<td>{idx + 1}</td>
									<td>{option.sku}</td>
									<td>{option.name}</td>
									<td>{option.inventory[i].stock}</td>
									<td>{option.reserved}</td>
									<td>
										<StockUpdate
											pid={props.pid}
											sku={option.sku}
											supplier={i}
											currentStock={
												option.inventory[i].stock
											}
											reserved={option.reserved}
											firebase={props.firebase}
										/>
									</td>
								</tr>
							))
						)}
					</tbody>
				</Table>
			</ModalBody>
		</Modal>
	)
}

class ProductCard extends React.Component {
	constructor (props) {
		super(props)

		this.state = {
			inventory: [],
			isVariantModalOpen: false,
			isInventoryModalOpen: false
		}
	}

	componentDidMount () {
		this.props.firebase
			.inventoryOfProduct(this.props.product.pid)
			.onSnapshot(doc => {
				if (doc.exists) {
					let inventory = doc.data()
					delete inventory.skus
					inventory = Object.keys(inventory).map(sku => ({
						...inventory[sku],
						sku
					}))
					this.setState({ inventory })
				}
			})
	}

	toggleVariantModal = () => {
		this.setState(prevState => ({
			isVariantModalOpen: !prevState.isVariantModalOpen
		}))
	}

	toggleInventoryModal = () => {
		this.setState(prevState => ({
			isInventoryModalOpen: !prevState.isInventoryModalOpen
		}))
	}

	toggleProduct = () => {
		const { firebase, product } = this.props

		firebase.product(product.pid).set(
			{
				isActive: !product.isActive
			},
			{ merge: true }
		)
	}

	render () {
		const { product } = this.props
		const prdThumb =
			Object.keys(product.assets).length > 0
				? product.assets[Object.keys(product.assets)[0]]
				: {}

		return (
			<div className='prd-card'>
				<span className='btn-toggle'>
					<Switch
						checked={product.isActive}
						onChange={this.toggleProduct}
						onColor='#0dac8e'
						offColor='#c9c9c9'
						height={20}
						width={40}
					/>
				</span>
				<Row className='align-items-center'>
					<div className='thumb'>
						<img
							src={prdThumb.downloadURL}
							className='img-fluid'
							alt={prdThumb.name}
						/>
					</div>
					<div className='content'>
						<div>
							<strong>
								<a
									href={`${siteURL}/p/${product.slug}`}
									rel='noopener noreferrer'
									target='_blank'
								>
									{product.title}
								</a>
								&nbsp; ({product.gender})
							</strong>
						</div>
						<div>
							<strong>
								<a
									href={`${siteURL}/${product.category.slug}`}
									rel='noopener noreferrer'
									target='_blank'
								>
									{product.category.name}
								</a>
							</strong>
						</div>
						<div>
							<div>
								List Price: <strong>{product.listPrice}</strong>
							</div>
							<div>
								Discount: <strong>{product.discount}</strong>
							</div>
							<div>
								Tax Percent:{' '}
								<strong>
									{product.taxPercent} (
									{product.isInclusiveTax
										? 'included'
										: 'not included'}
									)
								</strong>
							</div>
							<div>
								<Link
									to='#'
									onClick={this.toggleInventoryModal}
								>
									<strong>Inventory</strong>
								</Link>
								: &nbsp;
								{this.state.inventory.map((option, idx) => (
									<Badge
										key={idx}
										color={
											option.stock > 0
												? option.stock === 1
													? 'warning'
													: 'success'
												: 'danger'
										}
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
							{/* <Link
								to={{
									pathname: `${ROUTES.PRODUCT_LIST.path}/${product.pid}/edit`,
									state: { product }
								}}
							>
								<Button type='button' color='secondary' style={{ margin: 5 }}>
									<i className='fa fa-pencil' />
								</Button>
							</Link> */}
							<DeleteProduct
								pid={product.pid}
								firebase={this.props.firebase}
							/>
							{/* <Link
								to={{
									pathname: `${ROUTES.PRODUCT_LIST.path}/${product.pid}`,
									state: { product }
								}}
							>
								<Button type='button' color='info' style={{ margin: 5 }}>
									<i className='fa fa-ellipsis-h' />
								</Button>
							</Link> */}
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
					firebase={this.props.firebase}
				/>
			</div>
		)
	}
}

export default withFirebase(ProductCard)
