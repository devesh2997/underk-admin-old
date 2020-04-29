import React from 'react';
import {
	Modal,
	ModalHeader,
	ModalBody,
	Form,
	FormGroup,
	Label,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	Button,
	Alert,
	FormText
} from 'reactstrap';

const ADMIN_ROLES = [
	'SUPER',
	'EXTRA1',
	'EXTRA2',
	'EXTRA3',
	'EXTRA4'
];

export default class MakeAdminModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			password: '',
			roles: [],
			error: null,
			isPasswordVisible: false,
			isLoading: false
		};
	}

	onTextChange = event => {
		this.setState({
			[event.target.name]: event.target.value,
			error: null
		});
	}

	onSelectChange = event => {
		let roles = [], role;
		for(let i=0, len=event.target.options.length; i<len; i++) {
			role = event.target.options[i];

			if(role.selected) {
				roles.push(role.value);
			}
		}
		this.setState({ roles });
	};

	onSubmit = event => {
		event.preventDefault();
	}

	render() {
		const {
			isOpen,
			toggle,
			employee
		} = this.props;

		const {
			password,
			roles,
			error,
			isPasswordVisible,
			isLoading
		} = this.state;

		const isInvalid = password === '' || roles.length === 0;

		return (
			<Modal
				isOpen={isOpen}
				toggle={toggle}
				centered
				size="md"
			>
				<ModalHeader>
					<div>Assign admin roles to</div>
					<h4>{`${employee.name} - ${employee.id}`}</h4>
				</ModalHeader>
				<ModalBody>
					<Form onSubmit={this.onSubmit}>
						<FormGroup>
							<Label>Login Password</Label>
							<InputGroup>
								<Input
									type={isPasswordVisible ? 'text' : 'password'}
									name="password"
									value={password}
									onChange={this.onTextChange}
									placeholder="Enter login password"
								/>
								<InputGroupAddon addonType="append">
									<InputGroupText
										onClick={() => {
											this.setState(prevState => ({
												isPasswordVisible: !prevState.isPasswordVisible
											}));
										}}
									>
										{isPasswordVisible
											? <i className="fa fa-eye-slash" />
											: <i className="fa fa-eye" />
										}
									</InputGroupText>
								</InputGroupAddon>
							</InputGroup>
						</FormGroup>
						<FormGroup>
							<Label>Admin Role</Label>
							<Input
								type="select"
								name="roles"
								value={roles}
								onChange={this.onSelectChange}
								multiple
							>
								{ADMIN_ROLES.map(r => (
									<option key={r} value={r}>{r}</option>
								))}
							</Input>
							<FormText color="muted">
								Ctrl + <i className="fa fa-mouse-pointer" /> to select multiple roles.
							</FormText>
						</FormGroup>
						{error &&
							<Alert color="danger">{error.message}</Alert>
						}
						<FormGroup>
							<Button
								type="submit"
								color="primary"
								disabled={isInvalid}
							>
								{isLoading
									? <i className='fa fa-refresh fa-spin fa-fw' />
									: 'Save'
								}
							</Button>
						</FormGroup>
					</Form>
				</ModalBody>
			</Modal>
		);
	}
}
