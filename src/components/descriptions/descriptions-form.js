import React from "react";
import { Button, Col, Form, FormGroup, Input, Label } from "reactstrap";
import MultiSelect from "@kenshooui/react-multi-select";
import { withFirebase } from "../../firebase";

const INITIAL_STATE = {
	desktop: null,
	desktopObjectURL: "",
	mobile: null,
	mobileObjectURL: "",
	heading: "",
	forType: "",
	isItemsLoading: false,
	availableItems: [],
	selectedItems: [],
	savingDesc: false,
};

class DescriptionForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			...INITIAL_STATE,
		};
	}

	componentDidUpdate(_, prevState) {
		if (prevState.forType !== this.state.forType) {
			if (this.state.forType) {
				this.setState({ isItemsLoading: true });
				this.props.firebase.db
					.collection(this.state.forType)
					.get()
					.then((snapshot) => {
						let availableItems = [];
						snapshot.forEach((doc) => {
							availableItems.push({
								id: doc.id,
								label: doc.id,
							});
						});
						this.setState({
							isItemsLoading: false,
							availableItems,
						});
					});
			} else {
				this.setState({ availableItems: [] });
			}
		}
	}

	onChange = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};

	onImageChange = (e) => {
		const targetName = e.target.name;
		const file = e.target.files[0];
		this.setState({
			[targetName]: file,
			[`${targetName}ObjectURL`]: URL.createObjectURL(file),
		});
	};

	uploadTaskPromise = (file) => {
		return new Promise((resolve, reject) => {
			let storageRef = this.props.firebase.storage
				.ref()
				.child("assets_descriptions");
			let uploadTask = storageRef.child(file.name).put(file);
			uploadTask.on(
				"state_changed",
				(snapshot) => {},
				(error) => {
					console.log(error);
					reject();
				},
				() => {
					const metadata = uploadTask.snapshot.metadata;
					const {
						name,
						contentType,
						fullPath,
						size,
						bucket,
					} = metadata;

					uploadTask.snapshot.ref
						.getDownloadURL()
						.then((downloadURL) => {
							resolve({
								name,
								contentType,
								fullPath,
								size,
								bucket,
								downloadURL,
							});
						});
				}
			);
		});
	};

	onFinish = () => {
		this.setState({ ...INITIAL_STATE });
		document.forms[0].reset();
		this.props.onFinish();
	};

	onSubmit = async (e) => {
		e.preventDefault();
		this.setState({ savingDesc: true });
		const { desktop, mobile, heading, forType, selectedItems } = this.state;
		let description = {
			assets: [],
			heading,
			forType,
			forValues: [],
		};
		selectedItems.forEach((v) => {
			description.forValues.push(v.id);
		});
		if (desktop) {
			let asset = {
				desktop: await this.uploadTaskPromise(desktop),
				mobile: null,
			};
			if (mobile) {
				asset.mobile = await this.uploadTaskPromise(mobile);
			}
			description.assets.push(asset);
		}
		await this.props.firebase.descriptions().add(description);
		this.setState({ savingDesc: false });
		this.onFinish();
	};

	render() {
		const {
			desktopObjectURL,
			mobileObjectURL,
			heading,
			forType,
			isItemsLoading,
			availableItems,
			selectedItems,
			savingDesc,
		} = this.state;

		return (
			<Form onSubmit={this.onSubmit}>
				<FormGroup row style={{ marginBottom: "1rem" }}>
					<Col>
						<img
							src={desktopObjectURL}
							alt=""
							style={{ maxWidth: "150px" }}
						/>
					</Col>
					<Col>
						<Label>Image (desktop)</Label>
						<Input
							type="file"
							name="desktop"
							onChange={this.onImageChange}
						/>
					</Col>
				</FormGroup>
				<FormGroup row style={{ marginBottom: "1rem" }}>
					<Col>
						<img
							src={mobileObjectURL}
							alt=""
							style={{ maxWidth: "150px" }}
						/>
					</Col>
					<Col>
						<Label>Image (mobile)</Label>
						<Input
							type="file"
							name="mobile"
							onChange={this.onImageChange}
						/>
					</Col>
				</FormGroup>
				<FormGroup>
					<Label>Heading</Label>
					<Input
						type="text"
						name="heading"
						value={heading}
						onChange={this.onChange}
						placeholder="Enter heading"
					/>
				</FormGroup>
				<FormGroup>
					<Label>For type</Label>
					<Input
						type="select"
						name="forType"
						value={forType}
						onChange={this.onChange}
						required
					>
						<option value="">Select a type</option>
						<option value="categories">categories</option>
					</Input>
				</FormGroup>
				<FormGroup>
					<Label>For values</Label>
					<MultiSelect
						loading={isItemsLoading}
						items={availableItems}
						selectedItems={selectedItems}
						onChange={(v) => this.setState({ selectedItems: v })}
					/>
				</FormGroup>
				<FormGroup className="text-center">
					<Button type="submit" color="primary" disabled={savingDesc}>
						{savingDesc ? (
							<i className="fa fa-refresh fa-spin fa-fw" />
						) : (
							"Save"
						)}
					</Button>
					<Button
						type="button"
						color="secondary"
						style={{ marginLeft: 15 }}
						onClick={this.onFinish}
					>
						Cancel
					</Button>
				</FormGroup>
			</Form>
		);
	}
}

export default withFirebase(DescriptionForm);
