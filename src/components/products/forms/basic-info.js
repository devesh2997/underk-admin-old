import React from 'react';
import { Form, FormGroup, Input, Label } from 'reactstrap';

const BasicInfoForm = ({ product, categories, suppliers, onChange, onCategoryChange, onCheckboxChange }) => {
	return (
		<Form onSubmit={e => e.preventDefault()}>
			<FormGroup>
				<Label>Name / Title</Label>
				<Input type="text"
					name="title"
					value={product.title}
					onChange={onChange}
					placeholder="Enter name / title"
				/>
			</FormGroup>
			<FormGroup>
				<Label>Description</Label>
				<Input type="text"
					name="description"
					value={product.description}
					onChange={onChange}
					placeholder="Enter description"
				/>
			</FormGroup>
			<FormGroup>
				<Label>Slug / URL</Label>
				<Input type="text"
					name="slug"
					value={product.slug}
					onChange={onChange}
					placeholder="Enter slug / URL"
				/>
			</FormGroup>
			<FormGroup check>
				<Label check>
					<Input type="checkbox"
						name="isActive"
						checked={product.isActive}
						onChange={onCheckboxChange}
					/>
					 Active
				</Label>
			</FormGroup>
			<FormGroup>
				<Label>Gender</Label>
				<Input type="select" name="gender" value={product.gender} onChange={onChange}>
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
				</Input>
			</FormGroup>
			<FormGroup>
				<Label>Category</Label>
				<Input type="select" name="category" value={product.category} onChange={onCategoryChange}>
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
				</Input>
			</FormGroup>
			<FormGroup>
				<Label>Supplier</Label>
				<Input type="select" name="supplier" value={product.supplier} onChange={onChange}>
					<option value="">
						Select supplier
					</option>
					{
						suppliers.map(supplier => (
							<option key={supplier.sid} value={supplier.sid}>
								{supplier.name}
							</option>
						))
					}
				</Input>
			</FormGroup>
			<FormGroup>
				<Label>List Price</Label>
				<Input type="number"
					name="listPrice"
					value={product.listPrice}
					onChange={onChange}
					placeholder="Enter list price"
				/>
			</FormGroup>
			<FormGroup>
				<Label>Sale Price</Label>
				<Input type="number"
					name="salePrice"
					value={product.salePrice}
					onChange={onChange}
					placeholder="Enter sale price"
				/>
			</FormGroup>
			<FormGroup>
				<Label>Sale End Date</Label>
				<Input type="date"
					name="saleEndDate"
					value={product.saleEndDate}
					onChange={onChange}
					placeholder="Enter sale end date"
				/>
			</FormGroup>
			<FormGroup>
				<Label>Type</Label>
				<Input type="select" name="type" value={product.type} onChange={onChange}>
					<option value="">
						Select type
					</option>
					<option value="clothing">
						Clothing
					</option>
				</Input>
			</FormGroup>
		</Form>
	);
};

export default BasicInfoForm;
