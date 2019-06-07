import React, { Component } from 'react';

export default class FirebaseTest extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value : '',
		}
	}

	componentDidMount(){
		this.props.firebase.doSignInWithEmailAndPassword("ananddevesh22@gmail.com","devdas23")
		.then(authUser => {
			this.setState({value:"logged in"});
			console.log('here');
		})
		.catch(error => {
			this.setState({ value: error.toString() });
		});
	}

	render() {
		return <div>{this.state.value}</div>
	}
}
