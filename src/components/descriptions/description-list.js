import React from "react";
import { Button, Table } from "reactstrap";
import { withFirebase } from "../../firebase";

export const DescriptionListItem = ({ description, firebase }) => {
	return (
		<tr>
			<td>
				{description.assets.map((asset) => (
					<div key={asset.desktop ? asset.desktop.name : ""}>
						<img
							src={asset.desktop ? asset.desktop.downloadURL : ""}
							style={{ maxWidth: "150px" }}
							alt=""
						/>
					</div>
				))}
			</td>
			<td>
				{description.assets.map((asset) => (
					<div key={asset.desktop ? asset.desktop.name : ""}>
						<img
							src={asset.mobile ? asset.mobile.downloadURL : ""}
							style={{ maxWidth: "150px" }}
							alt=""
						/>
					</div>
				))}
			</td>
			<td>{description.heading}</td>
			<td>{description.forType}</td>
			<td>
				<pre>{JSON.stringify(description.forValues, null, 2)}</pre>
			</td>
			<td>
				<Button
					type="button"
					color="danger"
					onClick={() => {
						let isConfirmed = window.confirm(
							"Are you sure you want to delete this description?"
						);
						if (isConfirmed) {
							firebase.description(description.id).delete();
						}
					}}
				>
					<i className="fa fa-trash" />
				</Button>
			</td>
		</tr>
	);
};

const DescriptionList = ({ descriptions, ...rest }) => {
	return (
		<Table striped responsive>
			<thead>
				<tr>
					<th>Image (desktop)</th>
					<th>Image (mobile)</th>
					<th>Heading</th>
					<th>For type</th>
					<th>For values</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{descriptions.map((description) => (
					<DescriptionListItem
						key={description.id}
						description={description}
						{...rest}
					/>
				))}
			</tbody>
		</Table>
	);
};

export default withFirebase(DescriptionList);
