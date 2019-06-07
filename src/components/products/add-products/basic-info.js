import React from 'react';


const BasicInfoForm = (props) => {
	return (
		<div>
			<form onSubmit={props.onSubmit} className="admn_pnl-form">
				<div>
					<label>Name / Title</label>
					<input
						name="title"
						value={props.product.title}
						onChange={props.onChange}
						type="text"
						placeholder="Name / Title"
					/>
				</div>
				<div>
					<label>Description</label>
					<input
						name="description"
						value={props.product.description}
						onChange={props.onChange}
						type="text"
						placeholder="Description"
					/>
				</div>
				<div>
					<label>Slug / URL</label>
					<input
						name="slug"
						value={props.product.slug}
						onChange={props.onChange}
						type="text"
						placeholder="Slug / URL"
					/>
				</div>
				<div>
					<label>Active</label>
					<input
						name="isActive"
						type="checkbox"
						checked={props.product.isActive}
						onChange={props.onChangeCheckbox}
					/>
				</div>
				<div>
					<label>Gender</label>
					<select name="gender" value={props.product.gender} onChange={props.onChange} type="text">
						<option value="" defaultValue>
							Select gender
						</option>
						<option value="M">
							Male
						</option>
						<option value="F">
							Female
						</option>
						<option value="U">
							Unisex
						</option>
					</select>
				</div>
				<div>
					<label>Category</label>
					<select name="category" value={props.product.category} onChange={props.onChangeCategory} type="text">
						<option value="" defaultValue>
							Select category
						</option>
						{
							props.categories.map(category => (
								<option key={category.cid} value={category.cid}>
									{category.name}
								</option>
							))
						}
					</select>
				</div>
				<div>
					<label>Supplier</label>
					<select name="supplier" value={props.product.supplier} onChange={props.onChange} type="text">
						<option value="" defaultValue>
							Select supplier
						</option>
						{
							props.suppliers.map(supplier => (
								<option key={supplier.sid} value={supplier.sid}>
									{supplier.name}
								</option>
							))
						}
					</select>
				</div>
				<div>
					<label>List Price</label>
					<input
						name="listPrice"
						value={props.product.listPrice}
						onChange={props.onChange}
						type="number"
						placeholder="List Price"
					/>
				</div>
				<div>
					<label>Sale Price</label>
					<input
						name="salePrice"
						value={props.product.salePrice}
						onChange={props.onChange}
						type="number"
						placeholder="Sale Price"
					/>
				</div>
				<div>
					<label>Sale End Date</label>
					<input
						name="saleEndDate"
						value={props.product.saleEndDate}
						onChange={props.onChange}
						type="date"
						placeholder="Sale End Date"
					/>
				</div>
				<div>
					<label>Type</label>
					<select name="type" value={props.product.type} onChange={props.onChange} type="text">
						<option value="" defaultValue>
							Select type
						</option>
						<option value="clothing">
							Clothing
						</option>
					</select>
				</div>
			</form>
		</div>
	);
};

export default BasicInfoForm;

