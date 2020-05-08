import React, { Component } from 'react';
import {
	Alert,
	Button,
	Card,
	CardBody,
	Col,
	Container,
	Form,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	Row
} from 'reactstrap';
import { withFirebase } from '../../firebase';
import { withAuthorization } from '../../session';
import { compose } from 'recompose';
import { ROLES } from '../../constants';

const INITIAL_STATE = {
	email: '',
	error: '',
	isLinkSent: false
}

class ForgotPassword extends Component {
	constructor(props) {
		super(props);

		this.state = { ...INITIAL_STATE };
	}

	handleInputChange = event => {
		this.setState({ [event.target.name]: event.target.value });
	}

	validateInputs = () => {
		const { email } = this.state;
		if(email.trim() === '') {
			this.setState({ error: 'Invalid email' });
			return false;
		}
		this.setState({ error: '' });
		return true;
	}

	handleSubmit = event => {
		event.preventDefault();

		const { email } = this.state;

		if(this.validateInputs) {
			this.props.firebase
				.doPasswordReset(email)
				.then(() => {
					this.setState({ isLinkSent: true });
				})
				.catch(err => {
					this.setState({ error: err.message });
				});
		}
	};

	render() {
		const { email, error, isLinkSent } = this.state;

		return (
			<div className="app flex-row align-items-center">
				<Container>
					<Row className="justify-content-center">
						<Col md="6">
							<Card className="p-4">
								{!isLinkSent
									? <CardBody>
										<Form onSubmit={this.handleSubmit}>
											<h1>Forgot Password ?</h1>
											<p className="text-muted">A password reset link will be sent to your email</p>
											{error && <Alert color="danger">{error}</Alert>}
											<InputGroup className="mb-3">
												<InputGroupAddon addonType="prepend">
													<InputGroupText>
														<i className="icon-envelope"></i>
													</InputGroupText>
												</InputGroupAddon>
												<Input type="email"
													name="email"
													value={email}
													onChange={this.handleInputChange}
													placeholder="Email address"
													autoComplete="username"
													required
												/>
											</InputGroup>
											<Row>
												<Col xs="10">
													<Button type="submit" color="primary" className="px-4">
														Send Reset Link
													</Button>
												</Col>
												<Col xs="2" className="text-right">
													<Button type="button"
														onClick={() => this.props.history.push('/login')}
														color="link"
														className="px-0"
													>
														Login!
													</Button>
												</Col>
											</Row>
										</Form>
									</CardBody>
									: <CardBody>
										<Alert color="success">
											A password reset link has been sent to your email: <strong>{email}</strong>
											<br />
											If you didn't receive one, try resending it again or check your spam folder.
										</Alert>
										<Row>
											<Col xs="5">
												<Button color="primary" className="px-4">
													Resend Reset Link
												</Button>
											</Col>
											<Col xs="5">
												<Button color="secondary"
													onClick={() => this.setState({ isLinkSent: false })}
													className="px-4"
												>
													Change Email
												</Button>
											</Col>
											<Col xs="2" className="text-right">
												<Button color="link"
													onClick={() => this.props.history.push('/login')}
													className="px-0"
												>
													Login!
												</Button>
											</Col>
										</Row>
									</CardBody>
								}
							</Card>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

const condition = authUser => !(authUser && !!authUser.roles[ROLES.ADMIN]);

export default ForgotPassword;
