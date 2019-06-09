import React, { Component } from 'react';
import { withFirebase } from '../../firebase';

const INITIAL_STATE = {
	product: {

	}
};

class EditProductBase extends Component {
	constructor(props) {
		super(props);

		this.state = {
			...INITIAL_STATE
		};
	}

	render() {
		return (
			<div />
		);
	}
}

export default withFirebase(EditProductBase);
