import React from 'react';
import { Button, Col, Form, FormGroup, Input, Label } from 'reactstrap';
import ReactQuill from 'react-quill';
import ROUTES from '../../routes';

import 'react-quill/dist/quill.snow.css';

export default class BlogForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			author: (props.blog && props.blog.author) || 'underK',
			title: (props.blog && props.blog.title) || '',
			original: null,
			originalObjectURL: (props.blog && props.blog.assets.original.downloadURL) || '',
			placeholder: null,
			placeholderObjectURL: (props.blog && props.blog.assets.placeholder.downloadURL) || '',
			alt: (props.blog && props.blog.assets.original.name) || '',
			caption: (props.blog && props.blog.assets.caption) || '',
			description: (props.blog && props.blog.description) || '',
			body: (props.blog && props.blog.body) || '',
			category: (props.blog && props.blog.category) || '',
			keywords: (props.blog && props.blog.keywords && props.blog.keywords.join(', ')) || '',
			loading: false
		};

		this.image = React.createRef();
	}

	onTextInput = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	}

	onBodyInput = (html) => {
		this.setState({ body: html });
	}

	onImageChange = (e) => {
		const targetName = e.target.name;
		const file = e.target.files[0];
		this.setState({
			[`${targetName}ObjectURL`]: URL.createObjectURL(file),
			[targetName]: file
		});
	}

	uploadTaskPromise = (file, firebase) => {
		return new Promise((resolve, reject) => {
			let storageRef = firebase.storage.ref().child('assets_blogs');
			let uploadTask = storageRef.child(file.name).put(file);
			uploadTask.on(
				'state_changed',
				snapshot => {},
				error => {
					console.log(error);
					reject();
				},
				() => {
					const metadata = uploadTask.snapshot.metadata;
					const { name, contentType, fullPath, size, bucket } = metadata;

					uploadTask.snapshot.ref
						.getDownloadURL()
						.then(downloadURL => {
							resolve({
								name: this.state.alt || name,
								contentType,
								fullPath,
								size,
								bucket,
								downloadURL
							});
						});
				}
			);
		});
	}

	onSubmit = async (event) => {
		event.preventDefault();
		this.setState({ loading: true });

		const {
			author,
			title,
			original,
			placeholder,
			caption,
			description,
			body,
			category,
			keywords
		} = this.state;

		let blog = {
			author,
			title,
			description,
			body
		};
		if(category.trim().length > 0) {
			blog.category = category;
		}
		if(keywords.trim().length > 0) {
			blog.keywords = [];
			keywords.split(',').forEach(keyword => {
				if(keyword.trim().length > 0) {
					blog.keywords.push(keyword.trim());
				}
			});
		}
		if(original) {
			blog.assets = {
				original: await this.uploadTaskPromise(original, this.props.firebase),
				aspectRatio: Number((this.image.current.naturalHeight / this.image.current.naturalWidth).toFixed(4)),
				caption
			}
			if(placeholder) {
				blog.assets.placeholder = await this.uploadTaskPromise(placeholder, this.props.firebase);
			}
		}
		if(!(this.props.blog && this.props.blog.createdAt)) {
			let now = new Date();
			blog.createdAt = now.getTime();
		}

		await this.props.handleSubmit(blog);
		this.props.history.push(ROUTES.BLOG_LIST.path);
	}

	render() {
		const {
			author,
			title,
			originalObjectURL,
			placeholderObjectURL,
			alt,
			caption,
			description,
			body,
			category,
			keywords,
			loading
		} = this.state;

		const isSubmitDisabled =
			author.trim().length === 0
			|| title.trim().length === 0
			|| description.trim().length === 0
			|| body.length === 0
			|| loading;

		const modules = {
			toolbar: [
				// [{ font: [] }, { size: [] }],
				[{ header: [] }],
				['bold', 'italic', 'underline', 'strike'],
				[{ color: [] }, { background: [] }],
				[{ script: 'sub' }, { script: 'super' }],
				['blockquote', 'code-block'],
				[{ list: 'ordered' }, { list: 'bullet' }, { align: [] }],
				['link'],
				['clean']
			]
		}

		const formats = [
			// 'font', 'size',
			'header',
			'bold', 'italic', 'underline', 'strike',
			'color', 'background',
			'script',
			'blockquote', 'code-block',
			'list', 'align',
			'link'
		]

		return (
			<Form onSubmit={this.onSubmit}>
				<FormGroup>
					<Label>Author</Label>
					<Input type="text"
						name="author"
						value={author}
						onChange={this.onTextInput}
						placeholder="Enter author"
						required
					/>
				</FormGroup>
				<FormGroup>
					<Label>Title</Label>
					<Input type="text"
						name="title"
						value={title}
						onChange={this.onTextInput}
						placeholder="Enter title"
						required
					/>
				</FormGroup>
				<div
					style={{
						margin: '1rem -1.25rem',
						padding: '1rem 1.25rem',
						backgroundColor: '#e4e5e6'
					}}
				>
					<FormGroup row style={{ margin: '1rem 0' }}>
						<Col>
							<img
								ref={this.image}
								src={originalObjectURL}
								alt="Original IMG"
								style={{ maxWidth: '150px' }}
							/>
						</Col>
						<Col>
							<Label>Choose src</Label>
							<Input type="file"
								name="original"
								onChange={this.onImageChange}
							/>
						</Col>
					</FormGroup>
					<FormGroup row style={{ margin: '1rem 0' }}>
						<Col>
							<img
								src={placeholderObjectURL}
								alt="Placeholder IMG"
								style={{ maxWidth: '150px' }}
							/>
						</Col>
						<Col>
							<Label>Choose placeholder</Label>
							<Input type="file"
								name="placeholder"
								onChange={this.onImageChange}
							/>
						</Col>
					</FormGroup>
					<FormGroup>
						<Label>Alternate text</Label>
						<Input type="text"
							name="alt"
							value={alt}
							onChange={this.onTextInput}
							placeholder="Enter alternate text"
						/>
					</FormGroup>
					<FormGroup>
						<Label>Caption</Label>
						<Input type="textarea"
							name="caption"
							value={caption}
							onChange={this.onTextInput}
							placeholder="Enter caption"
						/>
					</FormGroup>
				</div>
				<FormGroup>
					<Label>Description</Label>
					<div style={styles.descContainerStyle}>
						<Input type="textarea"
							name="description"
							value={description}
							onChange={this.onTextInput}
							placeholder="Enter description"
							maxLength={300}
							required
						/>
						<span style={styles.counterStyle}>
							{(300 - description.length).toString()}
						</span>
					</div>
				</FormGroup>
				<FormGroup>
					<Label>Body</Label>
					<ReactQuill
						value={body}
						onChange={this.onBodyInput}
						modules={modules}
						formats={formats}
					/>
				</FormGroup>
				<FormGroup>
					<Label>Category</Label>
					<Input type="text"
						name="category"
						value={category}
						onChange={this.onTextInput}
						placeholder="Enter category"
					/>
				</FormGroup>
				<FormGroup>
					<Label>Keywords</Label>
					<Input type="textarea"
						name="keywords"
						value={keywords}
						onChange={this.onTextInput}
						placeholder="Enter keywords"
					/>
				</FormGroup>
				<FormGroup>
					<Button type="submit" color="primary" disabled={isSubmitDisabled}>
						{loading
							? <i className='fa fa-refresh fa-spin fa-fw' />
							: 'Save Blog'
						}
					</Button>
				</FormGroup>
			</Form>
		);
	}
}


const styles = {
	descContainerStyle: {
		position: 'relative'
	},
	counterStyle: {
		position: 'absolute',
		right: 15,
		bottom: 0,
		backgroundColor: 'rgba(255,255,255,0.25)',
		pointerEvents: 'none'
	}
};
