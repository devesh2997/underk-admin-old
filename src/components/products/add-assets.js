import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardBody, CardHeader } from 'reactstrap';


const AssetsUploader = (props) => {
	const { acceptedFiles, getRootProps, getInputProps } = useDropzone();

	const files = acceptedFiles.map(file => (
		<Card key={file.name+file.size}>
			<CardBody>
				<div>Name : {file.name}</div>
				<div>Size : {file.size}</div>
				<div>Type : {file.type}</div>
			</CardBody>
		</Card>
	));

	return (
		<section className="container">
			<div {...getRootProps({ className: 'dropzone' })}>
				<input {...getInputProps()} />
				<p>Drag 'n' drop some files here, or click to select files</p>
			</div>
			<aside>
				<h4>Files</h4>
				<ul>{files}</ul>
			</aside>
		</section>
	);
}

export default AssetsUploader;


