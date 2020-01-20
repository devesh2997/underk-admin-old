import React from 'react';
import BlogForm from './blog-form';
import { withFirebase } from '../../firebase';
import { Card, CardBody, CardHeader } from 'reactstrap';

class EditBlog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			blog: {}
		};
	}

	componentDidMount() {
		this.getBlog();
	}

	getBlog = async () => {
		this.setState({ loading: true });

		const doc = await this.props.firebase.db.doc(`blogs/${this.props.match.params.bid}`).get();
		let blog = {};
		if(doc.exists) {
			blog = { ...doc.data(), bid: doc.id };
		}

		this.setState({ blog, loading: false });
	}

	handleSubmit = (blog) => {
		return this.props.firebase.db.doc(`blogs/${this.props.match.params.bid}`).set(blog, { merge: true });
	}

	render() {
		const { loading, blog } = this.state;

		return (
			<Card>
				<CardHeader>
					<h4>Edit Blog</h4>
				</CardHeader>
				<CardBody>
					{loading
						? (
							<div className="animated fadeIn pt-3 text-center">Loading...</div>
						)
						: (
							<BlogForm
								blog={blog}
								handleSubmit={this.handleSubmit}
								{...this.props}
							/>
						)
					}
				</CardBody>
			</Card>
		);
	}
}

export default withFirebase(EditBlog);
