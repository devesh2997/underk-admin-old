import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Table,
  Row,
  Col,
  Button,
} from "reactstrap";
import * as POLICIES from "underk-policies";

import { EmployeeRepository } from "../../data";
import { AuthUserContext, withAllowedPolicies } from "../../session";
import EmployeeItem from "./EmployeeItem";
// import NewAdminForm from "./NewAdminForm";
import { EVENTS } from '../../constants';

const ControlledButton = withAllowedPolicies([POLICIES.EMPLOYEE_PUBLISH])(Button);

function EmployeeList(props) {
  const isMounted = useRef(true);

  const authUser = useContext(AuthUserContext);

  const employeeRepository = new EmployeeRepository(authUser.doRequest);

  const [isLoading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  // const [isFormOpen, toggleForm] = useState(false);

  useEffect(() => {
    getEmployees();
    window.addEventListener(EVENTS.EMPLOYEE_STATE_CHANGE, getEmployees);

    return () => {
      window.removeEventListener(EVENTS.EMPLOYEE_STATE_CHANGE, getEmployees);
      isMounted.current = false;
    };
  }, []);

  async function getEmployees() {
    isMounted.current && setLoading(true);
    try {
      const employees = await employeeRepository.getAll();
      isMounted.current && setEmployees(employees);
    } catch (error) {
      console.log(error);
    }
    isMounted.current && setLoading(false);
  }

  async function deleteEmployee(euid) {
    let message = "";
    try {
      message = await employeeRepository.delete(euid);
    } catch (error) {
      message = error.message;
    }
    // TODO: display message
    console.log(message);
  }

  return (
    <Card>
      <CardHeader>
        <Row className="align-items-center">
          <Col sm={6}>
            <h4>Employees</h4>
          </Col>
          <Col sm={6} className="text-right">
            {/* <ControlledButton
              type="button"
              color="secondary"
              onClick={() => toggleForm(!isFormOpen)}
            >
              <i className="fa fa-plus" /> New Admin
            </ControlledButton> */}
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        {/* <NewAdminForm
          isFormOpen={isFormOpen}
          toggleForm={() => toggleForm(!isFormOpen)}
          roles={roles}
          policies={policies}
        /> */}
        {isLoading ? (
          <center>
            <Spinner type="grow" color="primary" />
          </center>
        ) : (
          <Table hover responsive className="table-outline mb-0">
            <thead className="thead-light">
              <tr>
                <th>Employee</th>
                <th className="text-center">Email</th>
                <th className="text-center">Mobile</th>
                <th className="text-center">Address</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <EmployeeItem
                  key={employee.euid}
                  employee={employee}
                  deleteEmployee={deleteEmployee}
                />
              ))}
            </tbody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
}

export default withAllowedPolicies([POLICIES.EMPLOYEE_VIEW])(EmployeeList);
