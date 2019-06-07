import React, { Component } from 'react';
import { withFirebase } from '../../../firebase';
import { addProduct } from './index';
import { adminRoutes as ROUTES } from '../../../constants/routes';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';

const INITIAL_STATE = {
	color: '',
	style: '',
	design: '',
	sizes: {},
	currentSize: '',
	currentQuantity: '',
	colors: [],
	styles: [],
	designs: [],
	sizeOptions: [],
	addingSize: false,
	loadingColors: false,
	loadingStyles: false,
	loadingDesigns: false,
	loadingSizes: false
}

const AddSize = (props) => {
	return (
		<div>
			<div>
				<label>Size</label>
				<select name="size" value={props.currentSize} onChange={props.onSizeSelectionChange}>
					<option value="">
						Select sizes
					</option>
					{
						props.sizeOptions.map(size => (
							<option key={size.id} value={size.id}>
								{size.name}
							</option>
						))
					}
				</select>
			</div>
			<div>
				<label>Quantity</label>
				<input
					name="currentQuantity"
					value={props.currentQuantity}
					onChange={props.onCurrentQuantityChange}
					type="number"
					placeholder="Enter quantity"
				/>
			</div>
			<button disabled={props.isSizeSelectionInvalid} onClick={props.onSizeSubmit} type="button" className="admn_pnl-button">
				Submit size
			</button>
		</div>
	);
};

class ClothingForm extends Component {
	constructor(props) {
		super(props);

		this.state = { ...INITIAL_STATE };
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
					sizeOptions.push({ ...doc.data(), id: doc.id }));

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

	onCurrentQuantityChange = event => {
		this.setState({ currentQuantity: event.target.value });
	}

	onSizeSelectionChange = event => {
		this.setState({ currentSize: event.target.value });
	}

	addSizeButtonClicked = () => {
		this.setState({
			addingSize: true,
		});
	}
	
	generateSKU = (product) => {
		let sku = '';
		sku += product.supplier.sku;
		delete product.supplier.sku;
		sku += product.gender;
		sku += product.category_sku;
		delete product.category_sku;
		sku += product.attributes.style.sku;
		delete product.attributes.style.sku;
		sku += product.attributes.color.sku;
		delete product.attributes.color.sku;
		sku += product.attributes.design.sku;
		delete product.attributes.design.sku;

		Object.keys(product.attributes.sizes).forEach(size => {
			let sizeSku = product.attributes.sizes[size].sku;
			sizeSku = sku + sizeSku;
			product.attributes.sizes[size].sku = sizeSku;
		});

		return product;
	}
	
	onSizeSubmit = event => {
		event.preventDefault();
		let sizes = this.state.sizes;

		let selectedSize = this.state.sizeOptions.find(option => option.id === this.state.currentSize);

		const sku = selectedSize.sku;
		const quantity = this.state.currentQuantity;
		sizes[selectedSize.name] = {
			sku,
			quantity,
		}

		this.setState({
			sizes,
			addingSize: false,
			currentQuantity: '',
			currentSize: '',
		});
	}


	onSubmit = event => {
		event.preventDefault();
		let product = this.props.product;
		const sid = product.supplier;

		let supp = this.props.suppliers.find(sup => sup.sid === sid);
		let supplier = {};
		supplier['sid'] = supp.sid;
		supplier['sku'] = supp.sku;
		product['supplier'] = supplier;

		let { color, style, sizes, design, colors, styles, designs } = this.state;
		color = colors.find(c => c.id === color);
		style = styles.find(s => s.id === style);
		design = designs.find(d => d.id === design);

		product['attributes'] = { color, style, design, sizes };

		product = this.generateSKU(product);

		addProduct(product, this.props.firebase)
			.then(() => {
				this.setState({ ...INITIAL_STATE });
				this.props.history.push(ROUTES.PRODUCT_LIST.path);
			})
			.catch(error => {
				// Handle Error
				console.log(error);
			});
	}

	render() {
		const { color, style, design, colors, styles, designs, sizes, sizeOptions } = this.state;
		const { addingSize, loadingColors, loadingDesigns, loadingSizes, loadingStyles } = this.state;
		const { currentSize, currentQuantity } = this.state;
		const { isProductInvalid } = this.props;

		const isInvalidForAddingSize = color === "" || style === "" || design === "" || isProductInvalid;

		const isInvalid = color === "" || style === "" || design === "" || Object.keys(sizes).length === 0 || isProductInvalid;

		const isSizeSelectionInvalid = currentQuantity === "" || currentSize === "";

		return (
			<div>
				{(loadingColors || loadingSizes || loadingStyles || loadingDesigns)
					? <div>Loading ...</div>
					: <form onSubmit={this.onSubmit} className="admn_pnl-form">
						<div>
							<label>Color</label>
							<select name="color" value={color} onChange={this.onChange}>
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
							</select>
						</div>
						<div>
							<label>Style</label>
							<select name="style" value={style} onChange={this.onChange}>
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
							</select>
						</div>
						<div>
							<label>Design</label>
							<select name="design" value={design} onChange={this.onChange}>
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
							</select>
						</div>

						{addingSize
							? <AddSize
								currentQuantity={currentQuantity}
								currentSize={currentSize}
								sizeOptions={sizeOptions}
								isSizeSelectionInvalid={isSizeSelectionInvalid}
								onCurrentQuantityChange={this.onCurrentQuantityChange}
								onSizeSelectionChange={this.onSizeSelectionChange}
								onSizeSubmit={this.onSizeSubmit}
							/>
							: <button disabled={isInvalidForAddingSize} onClick={this.addSizeButtonClicked} type="button" className="admn_pnl-button">
								Add Size
							</button>
						}

						{!addingSize &&
							<button disabled={isInvalid} type="submit" className="admn_pnl-button">
								Submit
							</button>
						}
					</form>
				}
			</div>
		)
	}
}

export default compose(
	withFirebase,
	withRouter
)(ClothingForm);
