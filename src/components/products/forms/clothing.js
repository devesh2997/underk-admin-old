import React, { Component } from 'react';
import { Button, Card, CardBody, Form, FormGroup, Input, Label } from 'reactstrap';
import ROUTES from '../../../routes';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../../../firebase';

const generateSKU = (product, sizeOptions) => {
	let sku = '';
	sku += product.supplier_sku;
	delete product.supplier_sku;
	sku += product.gender;
	sku += "CLTH"; // CLOTHING TYPE SKU
	sku += product.attributes.subtype;
	sku += product.category.sku;
	sku += product.attributes.style.sku;
	delete product.attributes.style.sku;
	sku += product.attributes.color.sku;
	delete product.attributes.color.sku;
	sku += product.attributes.design.sku;
	delete product.attributes.design.sku;

	let newOptions = {};

	Object.keys(product.options.values).forEach(size => {
		let sizeSku = sizeOptions.find(s => s.name === size).sku;
		sizeSku = sku + sizeSku;
		newOptions[sizeSku] = {};
		newOptions[sizeSku]['quantity'] = Number(product.options.values[size].quantity);
		newOptions[sizeSku]['name'] = size;
		newOptions[sizeSku]['exists'] = true;
		product.options.values[size].sku = sizeSku;
	});
	delete product.options.values;
	product.options['skus'] = newOptions;

	return product;
}

const INITIAL_STATE = ({ product }) => {
	let sizes = {};

	if(product.options) {
		Object.values(product.options.skus).forEach(sku => {
			sizes[sku.name] = {
				quantity: sku.quantity
			}
		});
	}

	return {
		subtype: product.attributes ? product.attributes.subtype : '',
		color: product.attributes ? product.attributes.color.id : '',
		style: product.attributes ? product.attributes.style.id : '',
		design: product.attributes ? product.attributes.design.id : '',
		sizes,
		currentSize: '',
		currentQuantity: '',
		colors: [],
		styles: [],
		designs: [],
		sizeOptions: [],
		loadingColors: false,
		loadingStyles: false,
		loadingDesigns: false,
		loadingSizes: false
	}
};

const SizeCard = ({ action, sizeOptions, size, quantity, onSizeChange, onQuantityChange, onAction, isActionBtnDisabled }) => {
	return (
		<Card style={{ margin: '1rem' }}>
			<CardBody>
				<FormGroup>
					<Label>Size</Label>
					{action === 'delete'
						? <Input type="text" name="size" value={size} disabled />
						: <Input type="select" name="size" value={size} onChange={onSizeChange}>
							<option value="">
								Select sizes
							</option>
							{
								sizeOptions.map(s => (
									<option key={s.id} value={s.id}>
										{s.name}
									</option>
								))
							}
						</Input>
					}
				</FormGroup>
				<FormGroup>
					<Label>Quantity</Label>
					<Input type="number"
						name="currentQuantity"
						value={quantity}
						onChange={onQuantityChange}
						placeholder="Enter quantity"
					/>
				</FormGroup>
				<FormGroup className="text-center">
					{action === 'delete'
						? <Button type="button" color="danger" onClick={onAction}>
							<i className="fa fa-trash"></i>
						</Button>
						: <Button type="button" color="secondary" onClick={onAction} disabled={isActionBtnDisabled}>
							<i className="fa fa-plus"></i>
						</Button>
					}
				</FormGroup>
			</CardBody>
		</Card>
	);
};

class ClothingForm extends Component {
	constructor(props) {
		super(props);

		this.state = { ...INITIAL_STATE(props) };
	}

	componentDidMount() {
		this.setState({ loadingColors: true, loadingStyles: true, loadingDesigns: true, loadingSizes: true });

		this.getColors = this.props.firebase.clothingAttributes().collection('colors')
			.onSnapshot(snapshot => {
				let colors = [];

				snapshot.forEach(doc =>
					colors.push({ ...doc.data(), id: doc.id }));

				this.setState({
					colors,
					loadingColors: false,
				})
			});

		this.getStyles = this.props.firebase.clothingAttributes().collection('styles')
			.onSnapshot(snapshot => {
				let styles = [];

				snapshot.forEach(doc =>
					styles.push({ ...doc.data(), id: doc.id }));

				this.setState({
					styles,
					loadingStyles: false,
				})
			});

		this.getDesigns = this.props.firebase.clothingAttributes().collection('designs')
			.onSnapshot(snapshot => {
				let designs = [];

				snapshot.forEach(doc =>
					designs.push({ ...doc.data(), id: doc.id }));

				this.setState({
					designs,
					loadingDesigns: false,
				})
			});

		this.getSizes = this.props.firebase.clothingAttributes().collection('sizes')
			.onSnapshot(snapshot => {
				let sizeOptions = [];

				snapshot.forEach(doc =>
					sizeOptions.push({ ...doc.data(), id: doc.id })
				);

				this.setState({
					sizeOptions,
					loadingSizes: false,
				})
			});
	}

	componentWillUnmount() {
		this.getColors();
		this.getSizes();
		this.getStyles();
		this.getDesigns();
	}

	onChange = event => {
		this.setState({ [event.target.name]: event.target.value });
	}

	handleSizeChange = sizes => {
		this.setState({ sizes });
	};

	onCurrentSizeChange = event => {
		this.setState({ currentSize: event.target.value });
	}

	onCurrentQuantityChange = event => {
		this.setState({ currentQuantity: event.target.value });
	}

	onPreviousQuantityChange = (event, size) => {
		let sizes = this.state.sizes;
		sizes[size].quantity = event.target.value;
		this.setState({ sizes });
	}

	onSizeAdd = event => {
		event.preventDefault();
		let sizes = this.state.sizes;

		let selectedSize = this.state.sizeOptions.find(option => option.id === this.state.currentSize);

		// const sku = selectedSize.sku;
		const quantity = this.state.currentQuantity;
		sizes[selectedSize.name] = {
			// sku,
			quantity,
		}

		this.setState({
			sizes,
			currentQuantity: '',
			currentSize: '',
		});
	}

	onSizeDelete = (event, size) => {
		event.preventDefault();
		let sizes = this.state.sizes;
		delete sizes[size];
		this.setState({ sizes });
	}


	onSubmit = event => {
		event.preventDefault();
		let product = this.props.product;

		let cat = this.props.categories.find(cat => cat.cid === product.category);
		product['category'] = cat;

		let supp = this.props.suppliers.find(supp => supp.sid === product.supplier_id);
		product['supplier_sku'] = supp.sku;

		let { subtype, color, style, sizes, design, colors, styles, designs, sizeOptions } = this.state;
		color = colors.find(c => c.id === color);
		style = styles.find(s => s.id === style);
		design = designs.find(d => d.id === design);

		product['attributes'] = { subtype, color, style, design };
		product['options'] = {
			type: 'multiple',
			based_on : 'size',
			values : sizes,
		}
		product = generateSKU(product, sizeOptions);

		product.listPrice = Number(product.listPrice);
		// product.salePrice = Number(product.salePrice) ? Number(product.salePrice) : product.listPrice;

		this.props.handleSubmit(product, this.props.firebase)
			.then(() => {
				this.props.history.push(ROUTES.PRODUCT_LIST.path);
			})
			.catch(error => {
				// Handle Error
				console.log(error);
			});
	}

	render() {
		const { subtype, color, style, design, colors, styles, designs, sizes, sizeOptions } = this.state;
		const { loadingColors, loadingDesigns, loadingSizes, loadingStyles } = this.state;
		const { currentSize, currentQuantity } = this.state;
		const { isProductInvalid } = this.props;

		const isInvalidForAddingSize = color === '' || style === '' || design === '' || isProductInvalid;

		const isInvalid = subtype === '' || color === '' || style === '' || design === '' || Object.keys(sizes).length === 0 || isProductInvalid;

		const isSizeSelectionInvalid = currentQuantity === '' || currentSize === '';

		return (
			<div>
				{(loadingColors || loadingSizes || loadingStyles || loadingDesigns)
					? <div className="animated fadeIn pt-3 text-center">Loading...</div>
					: <Form onSubmit={this.onSubmit}>
						<FormGroup>
							<Label>Sub type</Label>
							<Input type="select" name="subtype" value={subtype} onChange={this.onChange}>
								<option value="">
									Select subtype
								</option>
								<option value="TP">
									Topwear
								</option>
								<option value="BW">
									Bottomwear
								</option>
								<option value="AC">
									Accessory
								</option>
							</Input>
							<Label>Color</Label>
							<Input type="select" name="color" value={color} onChange={this.onChange}>
								<option value="">
									Select color
								</option>
								{
									colors.map(color => (
										<option key={color.id} value={color.id}>
											{color.name}
										</option>
									))
								}
							</Input>
						</FormGroup>
						<FormGroup>
							<Label>Style</Label>
							<Input type="select" name="style" value={style} onChange={this.onChange}>
								<option value="">
									Select style
								</option>
								{
									styles.map(style => (
										<option key={style.id} value={style.id}>
											{style.name}
										</option>
									))
								}
							</Input>
						</FormGroup>
						<FormGroup>
							<Label>Design</Label>
							<Input type="select" name="design" value={design} onChange={this.onChange}>
								<option value="">
									Select design
								</option>
								{
									designs.map(design => (
										<option key={design.id} value={design.id}>
											{design.name}
										</option>
									))
								}
							</Input>
						</FormGroup>

						<div className="flex-card_container">
							{Object.keys(sizes).map(size =>
								<SizeCard key={size}
									action="delete"
									size={size}
									quantity={sizes[size].quantity}
									onQuantityChange={event => this.onPreviousQuantityChange(event, size)}
									onAction={event => this.onSizeDelete(event, size)}
								/>
							)}
							<SizeCard action="add"
								sizeOptions={sizeOptions}
								size={currentSize}
								quantity={currentQuantity}
								onSizeChange={this.onCurrentSizeChange}
								onQuantityChange={this.onCurrentQuantityChange}
								onAction={this.onSizeAdd}
								isActionBtnDisabled={isSizeSelectionInvalid || isInvalidForAddingSize}
							/>
						</div>

						<Button type="submit" color="primary" disabled={isInvalid}>
							Submit
						</Button>
					</Form>
				}
			</div>
		)
	}
}

export default compose(
	withFirebase,
	withRouter
)(ClothingForm);
