import React, { Component } from 'react';
import {
	Alert,
	Button,
	Card,
	CardBody,
	CardHeader,
	Form,
	FormGroup,
	Input,
	Label
} from 'reactstrap';

import ROUTES from '../../routes';
import Employee from './models/employee';

export default class AddEmployee extends Component {
	constructor(props) {
		super(props);

		this.state = {
			name: '',
			email: '',
			mobile: '',
			address: '',
			error: null,
			isLoading: false
		};
	}

	onTextChange = event => {
		this.setState({
			[event.target.name]: event.target.value,
			error: null
		});
	};

	onSubmit = async event => {
		event.preventDefault();
		this.setState({ isLoading: true });

		let employee = new Employee({
			name: this.state.name,
			email: this.state.email,
			mobile: this.state.mobile,
			address: this.state.address
		});

		try {
			await employee.save();
			this.props.history.push(ROUTES.EMPLOYEE_LIST.path);
		} catch(error) {
			this.setState({ error, isLoading: false });
		}
	}

	render() {
		const { name, email, mobile, address, error, isLoading } = this.state;

		const isInvalid = name === '' || email === '' || mobile === '' || address === '' || isLoading;

		return (
			<Card>
				<CardHeader>
					<h4>Add Employee</h4>
				</CardHeader>
				<CardBody>
					<Form onSubmit={this.onSubmit}>
						<FormGroup>
							<Label>Name</Label>
							<Input type="text"
								name="name"
								value={name}
								onChange={this.onTextChange}
								placeholder="Enter name"
							/>
						</FormGroup>
						<FormGroup>
							<Label>Email</Label>
							<Input type="email"
								name="email"
								value={email}
								onChange={this.onTextChange}
								placeholder="Enter email"
							/>
						</FormGroup>
						<FormGroup>
							<Label>Mobile</Label>
							<Input type="text"
								name="mobile"
								value={mobile}
								onChange={this.onTextChange}
								placeholder="Enter mobile"
							/>
						</FormGroup>
						<FormGroup>
							<Label>Address</Label>
							<Input type="text"
								name="address"
								value={address}
								onChange={this.onTextChange}
								placeholder="Enter address"
							/>
						</FormGroup>
						{error &&
							<Alert color="danger">{error.message}</Alert>
						}
						<FormGroup>
							<Button
								type="submit"
								color="primary"
								disabled={isInvalid}
								style={{ marginRight: 10 }}
							>
								{isLoading
									? <i className='fa fa-refresh fa-spin fa-fw' />
									: 'Save'
								}
							</Button>
							<Button
								type="button"
								color="secondary"
								onClick={() => this.props.history.push(ROUTES.EMPLOYEE_LIST.path)}
							>
								Cancel
							</Button>
						</FormGroup>
					</Form>
				</CardBody>
			</Card>
		);
	}
}
