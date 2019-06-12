import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardBody, Container, Button } from 'reactstrap';
import { withFirebase } from '../../firebase';
import { tsExpressionWithTypeArguments } from '@babel/types';


const AssetsSelector = (props) => {
	const onDrop = useCallback(acceptedFiles => {
		props.onFilesSelected(acceptedFiles);
	}, [])

	const { getRootProps, getInputProps } = useDropzone({ onDrop });

	return (
		<Card {...getRootProps({ className: 'dropzone' })} style={{ padding: 30 }}>
			<div>
				<input {...getInputProps()} />
				<p>Drag 'n' drop some files here, or click to select files.</p>
				<p>File names should be unique.</p>
			</div>
		</Card>
	);
}

const AssetView = (props) => {
	let file = props.file;
	return (
		<Card key={file.name + file.size}>
			<CardBody>
				<div>Name : {file.name}</div>
				<span>Size : {Math.round(file.size / 1024)} KB </span>&nbsp;
					<span>Type : {file.type}</span>&nbsp;
				</CardBody>
		</Card>
	);
}


//Props must contain product slug
class AssetsUploader extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedFiles: [],
			assets: {},
			isUploading: false,
			numOfFiles: 0,
			numOfFilesUploaded: 0,
			error: null,
		}
	}

	onFilesSelected = (selectedFiles) => {
		this.setState({ selectedFiles });
	}

	uploadAssets = () => {
		this.setState({ isUploading: true });
		this.setState({ numOfFiles: this.state.selectedFiles.length });
		let storageRef = this.props.firebase.productAssetsRef().child(this.props.product_slug);
		this.state.selectedFiles.map(file => {
			let uploadTask = storageRef.child(file.name).put(file);
			uploadTask.on('state_changed', (snapshot) => {
			}, (error) => {
				this.setState({ error })
			}, () => {
				const metadata = uploadTask.snapshot.metadata;
				const {name, contentType, fullPath, size, bucket} = metadata;
				uploadTask.snapshot.ref.getDownloadURL().then((downloadURL)=>{
					let newAsset = {name, contentType,fullPath,size,bucket,downloadURL};
					let assets = this.state.assets;
					assets[name] = newAsset;
					this.setState({ numOfFilesUploaded: this.state.numOfFilesUploaded + 1, assets });
					if (this.state.numOfFiles === this.state.numOfFilesUploaded) {
						this.setState({ isUploading: false, numOfFilesUploaded:0 });
						this.props.onComplete(this.state.assets);
					}
				});
			});
		});
	}

	isUploadAssetButtonDisabled = () => {
		return this.state.isUploading || this.state.selectedFiles.length === 0;
	}

	render() {
		const { numOfFiles, numOfFilesUploaded, error } = this.state;
		const files = this.state.selectedFiles.map(file => (
			<AssetView key={file.name + file.size} file={file} />
		));

		if (!this.props.product_slug) return null;
		return (
			<Container>
				{
					this.state.isUploading &&
					<div>
						<div>Uploading ...</div>
					</div>
				}
				<div>{numOfFilesUploaded} out of {numOfFiles} uploaded</div>
				<AssetsSelector onFilesSelected={this.onFilesSelected} />
				{files}
				<Button onClick={this.uploadAssets} color="primary" disabled={this.isUploadAssetButtonDisabled()}>
					Upload Assets
				</Button>
				{error && <span>{error}</span>}
			</Container>
		);
	}

}

export default withFirebase(AssetsUploader);

export { AssetsSelector };


