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
			src: null,
			srcObjectURL: (props.blog && props.blog.image.src) || '',
			placeholder: null,
			placeholderObjectURL: (props.blog && props.blog.image.placeholder) || '',
			body: (props.blog && props.blog.body) || '',
			category: (props.blog && props.blog.category) || '',
			keywords: (props.blog && props.blog.keywords && props.blog.keywords.join(', ')) || '',
			loading: false
		};
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
			let storageRef = firebase.storage.ref().child('assets_blogs')
			let uploadTask = storageRef.child(file.name).put(file)
			uploadTask.on(
				'state_changed',
				snapshot => {},
				error => {
					console.log(error)
					reject()
				},
				() => {
					uploadTask.snapshot.ref
						.getDownloadURL()
						.then(downloadURL => {
							resolve(downloadURL)
						})
				}
			)
		})
	}

	onSubmit = async (event) => {
		event.preventDefault();
		this.setState({ loading: true });

		const {
			author,
			title,
			src,
			placeholder,
			body,
			category,
			keywords
		} = this.state;

		let blog = {
			author,
			title,
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
		if(src) {
			blog.image = {
				src: await this.uploadTaskPromise(src, this.props.firebase)
			}
			if(placeholder) {
				blog.image.placeholder = await this.uploadTaskPromise(placeholder, this.props.firebase);
			}
		}

		await this.props.handleSubmit(blog);
		this.props.history.push(ROUTES.BLOG_LIST.path);
	}

	render() {
		const {
			author,
			title,
			srcObjectURL,
			placeholderObjectURL,
			body,
			category,
			keywords,
			loading
		} = this.state;

		const isSubmitDisabled =
			author.trim().length === 0
			|| title.trim().length === 0
			|| body.length === 0
			|| loading;

		const modules = {
			toolbar: [
				[{ font: [] }, { size: [] }],
				['bold', 'italic', 'underline', 'strike'],
				[{ color: [] }, { background: [] }],
				[{ script: 'sub' }, { script: 'super' }],
				[{ header: 1 }, { header: 2 }, 'blockquote', 'code-block'],
				[{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }, { align: [] }],
				['link'],
				['clean']
			]
		}

		const formats = [
			'font', 'size',
			'bold', 'italic', 'underline', 'strike',
			'color', 'background',
			'script',
			'header', 'blockquote', 'code-block',
			'list', 'indent', 'align',
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
				<FormGroup row style={{ margin: '1rem 0' }}>
					<Col>
						<img src={srcObjectURL} alt="Original" style={{ maxWidth: '150px' }} />
					</Col>
					<Col>
						<Label>Choose src</Label>
						<Input type="file"
							name="src"
							onChange={this.onImageChange}
						/>
					</Col>
				</FormGroup>
				<FormGroup row style={{ margin: '1rem 0' }}>
					<Col>
						<img src={placeholderObjectURL} alt="Placeholder" style={{ maxWidth: '150px' }} />
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
						Save Blog
					</Button>
				</FormGroup>
			</Form>
		);
	}
}
