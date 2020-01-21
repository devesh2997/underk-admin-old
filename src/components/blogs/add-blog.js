import React from 'react';
import BlogForm from './blog-form';
import { withFirebase } from '../../firebase';
import { Card, CardBody, CardHeader } from 'reactstrap';

class AddBlog extends React.Component {
	handleSubmit = (blog) => {
		return this.props.firebase.db.collection('blogs').add(blog);
	}

	render() {
		return (
			<Card>
				<CardHeader>
					<h4>Add Blog</h4>
				</CardHeader>
				<CardBody>
					<BlogForm
						handleSubmit={this.handleSubmit}
						{...this.props}
					/>
				</CardBody>
			</Card>
		);
	}
}

export default withFirebase(AddBlog);
