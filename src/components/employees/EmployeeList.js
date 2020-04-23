import React, { Component } from 'react';
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Col,
	Row,
	Spinner,
	Table,
	UncontrolledTooltip
} from 'reactstrap';

import { firebase } from '../../index';
import ROUTES from '../../routes';
import Employee from './models/employee';

export default class EmployeeList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoading: false,
			employees: [],
		};
	}

	componentDidMount() {
		this.setState({ isLoading: true });

		this.unsubscribe = firebase.employees()
			.onSnapshot(snapshot => {
				let employees = [];

				snapshot.forEach(doc => {
					employees.push(new Employee({ ...doc.data(), id: doc.id }));
				});

				this.setState({
					isLoading: false,
					employees
				});
			});
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	render() {
		const { isLoading, employees } = this.state;

		return (
			<Card>
				<CardHeader>
					<Row className="align-items-center">
						<Col md={6}>
							<h4>Employees</h4>
						</Col>
						<Col md="6" className="text-right">
							<Button type="button"
								color="primary"
								onClick={() => this.props.history.push(ROUTES.ADD_EMPLOYEE.path)}
							>
								<i className="fa fa-plus" /> Add Employee
							</Button>
						</Col>
					</Row>
				</CardHeader>
				<CardBody>
					{isLoading
						? (
							<center>
								<Spinner type="grow" color="primary" />
							</center>
						)
						: (
							<Table striped responsive>
								<thead>
									<tr>
										<th>ID</th>
										<th>Name</th>
										<th>isAdmin</th>
										<th>Email</th>
										<th>Mobile</th>
										<th>Address</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{employees.map((employee, idx) => (
										<tr key={employee.id}>
											<td>{employee.id}</td>
											<td>{employee.name}</td>
											<td>{employee.isAdmin.toString()}</td>
											<td>{employee.email}</td>
											<td>{employee.mobile}</td>
											<td>{employee.address}</td>
											<td>
												<Button
													id={`makAdmBtn-${employee.id}`}
													type="button"
													color="success"
													style={{ margin: 3 }}
												>
													<i className="fa fa-user-secret" />
													<UncontrolledTooltip
														placement="top"
														target={`makAdmBtn-${employee.id}`}
													>
														Make Admin
													</UncontrolledTooltip>
	  												</Button>
												<Button
													id={`remEmpBtn-${employee.id}`}
													type="button"
													color="danger"
													style={{ margin: 3 }}
												>
													<i className="fa fa-trash" />
													<UncontrolledTooltip
														placement="top"
														target={`remEmpBtn-${employee.id}`}
													>
														Remove Employee
													</UncontrolledTooltip>
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</Table>
						)
					}
				</CardBody>
			</Card>
		);
	}
}
