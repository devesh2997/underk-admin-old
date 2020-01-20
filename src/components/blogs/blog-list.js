import React, { Component } from 'react';
import { Button, Card, CardBody, CardHeader, Table } from 'reactstrap';
import { withFirebase } from '../../firebase';
import { Link } from 'react-router-dom';

import ROUTES from '../../routes';

const DeleteCategory = ({ bid, firebase }) => (
	<Button type="button"
		color="danger"
		onClick={() => {
			let isConfirmed = window.confirm('Are you sure you want to delete this blog?');
			if(isConfirmed) {
				firebase.db.doc(`blogs/${bid}`).delete();
			}
		}}
		style={{ margin: 5 }}
	>
		<i className="fa fa-trash"></i>
  	</Button>
);



class BlogList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			blogs: [],
		}
	}

	componentDidMount() {
		this.setState({ loading: true });

		this.unsubscribe = this.props.firebase
			.db.collection('blogs')
			.onSnapshot(snapshot => {
				let blogs = [];

				snapshot.forEach(doc =>
					blogs.push({ ...doc.data(), bid: doc.id }),
				);

				this.setState({
					blogs,
					loading: false,
				});
			});
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	render() {
		const { blogs, loading } = this.state;

		return (
			<Card>
				<CardHeader>
					<h4>Blogs</h4>
				</CardHeader>
				<CardBody>
					{loading && <div className="animated fadeIn pt-3 text-center">Loading...</div>}
					<Table striped responsive>
						<thead>
							<tr>
								<th>#</th>
								<th>Blog ID</th>
								<th>Title</th>
								<th>Author</th>
								<th>Category</th>
								<th>Keywords</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{blogs.map((blog, idx) => (
								<tr key={blog.bid}>
									<td>{idx+1}</td>
									<td>{blog.bid}</td>
									<td>{blog.title}</td>
									<td>{blog.author}</td>
									<td>{blog.category || 'NULL'}</td>
									<td>{blog.keywords ? blog.keywords.join(', ') : 'NULL'}</td>
									<td>
										<Link
											to={`${ROUTES.BLOG_LIST.path}/${blog.bid}/edit`}
										>
											<Button type='button' color='secondary' style={{ margin: 5 }}>
												<i className='fa fa-pencil' />
											</Button>
										</Link>
										<DeleteCategory bid={blog.cid} firebase={this.props.firebase} />
									</td>
								</tr>
							))}
						</tbody>
					</Table>
				</CardBody>
			</Card>
		);
	}
}

export default withFirebase(BlogList);
