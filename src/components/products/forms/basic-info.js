import React from 'react';

const BasicInfoForm = ({ product, categories, suppliers, onChange, onCategoryChange, onCheckboxChange }) => {
	return (
		<form onSubmit={e => e.preventDefault()} className="admn_pnl-form">
			<div>
				<label>Name / Title</label>
				<input
					name="title"
					value={product.title}
					onChange={onChange}
					type="text"
					placeholder="Name / Title"
				/>
			</div>
			<div>
				<label>Description</label>
				<input
					name="description"
					value={product.description}
					onChange={onChange}
					type="text"
					placeholder="Description"
				/>
			</div>
			<div>
				<label>Slug / URL</label>
				<input
					name="slug"
					value={product.slug}
					onChange={onChange}
					type="text"
					placeholder="Slug / URL"
				/>
			</div>
			<div>
				<label>Active</label>
				<input
					name="isActive"
					type="checkbox"
					checked={product.isActive}
					onChange={onCheckboxChange}
				/>
			</div>
			<div>
				<label>Gender</label>
				<select name="gender" value={product.gender} onChange={onChange}>
					<option value="">
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
				<select name="category" value={product.category} onChange={onCategoryChange}>
					<option value="">
						Select category
					</option>
					{
						categories.map(category => (
							<option key={category.cid} value={category.cid}>
								{category.name}
							</option>
						))
					}
				</select>
			</div>
			<div>
				<label>Supplier</label>
				<select name="supplier" value={product.supplier} onChange={onChange} type="text">
					<option value="" defaultValue>
						Select supplier
					</option>
					{
						suppliers.map(supplier => (
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
					value={product.listPrice}
					onChange={onChange}
					type="number"
					placeholder="List Price"
				/>
			</div>
			<div>
				<label>Sale Price</label>
				<input
					name="salePrice"
					value={product.salePrice}
					onChange={onChange}
					type="number"
					placeholder="Sale Price"
				/>
			</div>
			<div>
				<label>Sale End Date</label>
				<input
					name="saleEndDate"
					value={product.saleEndDate}
					onChange={onChange}
					type="date"
					placeholder="Sale End Date"
				/>
			</div>
			<div>
				<label>Type</label>
				<select name="type" value={product.type} onChange={onChange} type="text">
					<option value="" defaultValue>
						Select type
					</option>
					<option value="clothing">
						Clothing
					</option>
				</select>
			</div>
		</form>
	);
};

export default BasicInfoForm;
