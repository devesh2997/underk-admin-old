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
  UncontrolledTooltip,
  Badge,
} from "reactstrap";
import * as POLICIES from "underk-policies";

import { RoleRepository, PolicyRepository } from "../../data";
import { AuthUserContext, withAllowedPolicies } from "../../session";
import NewRoleForm from "./NewRoleForm";
import { EVENTS } from "../../constants";
import { ButtonWithConfirmation } from "../common";

const ControlledButton = withAllowedPolicies([POLICIES.ADMIN_PUBLISH])(Button);
const ControlledButtonWithConfirmation = withAllowedPolicies([
  POLICIES.ADMIN_PUBLISH,
])(ButtonWithConfirmation);

function RoleList(props) {
  const isMounted = useRef(true);

  const authUser = useContext(AuthUserContext);

  const roleRepository = new RoleRepository(authUser.doRequest);
  const policyRepository = new PolicyRepository(authUser.doRequest);

  const [isLoading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [isFormOpen, toggleForm] = useState(false);

  useEffect(() => {
    getRoles();
    getPolicies();
    window.addEventListener(EVENTS.ROLE_STATE_CHANGE, getRoles);

    return () => {
      window.removeEventListener(EVENTS.ROLE_STATE_CHANGE, getRoles);
      isMounted.current = false;
    };
  }, []);

  async function getRoles() {
    isMounted.current && setLoading(true);
    try {
      const roles = await roleRepository.getAll();
      isMounted.current && setRoles(roles);
    } catch (error) {
      console.log(error);
    }
    isMounted.current && setLoading(false);
  }

  async function getPolicies() {
    try {
      const policies = await policyRepository.getAll();
      isMounted.current && setPolicies(policies);
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteRole(id) {
    let message = "";
    try {
      message = await roleRepository.delete(id);
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
            <h4>Roles</h4>
          </Col>
          <Col sm={6} className="text-right">
            <ControlledButton
              type="button"
              color="secondary"
              onClick={() => toggleForm(!isFormOpen)}
            >
              <i className="fa fa-plus" /> New Role
            </ControlledButton>
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        <NewRoleForm
          isFormOpen={isFormOpen}
          toggleForm={() => toggleForm(!isFormOpen)}
          policies={policies}
        />
        {isLoading ? (
          <center>
            <Spinner type="grow" color="primary" />
          </center>
        ) : (
          <Table hover responsive className="table-outline mb-0">
            <thead className="thead-light">
              <tr>
                <th>Role</th>
                <th className="text-center">Policies</th>
                <th className="text-center">Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>{role.name}</td>
                  <td className="text-center">
                    {role.policies.map((policy) => (
                      <Badge
                        key={policy.id}
                        color="info"
                        pill
                        style={{ margin: 3 }}
                      >
                        {policy.name}
                      </Badge>
                    ))}
                  </td>
                  <td className="text-center">{role.description}</td>
                  <td>
                    <ControlledButtonWithConfirmation
                      id={`delRolBtn-${role.id}`}
                      type="button"
                      color="danger"
                      icon="fa fa-trash"
                      confirmationText={`Are you sure you want to delete the role ${role.name}?`}
                      onConfirmation={() => deleteRole(role.id)}
                    >
                      <UncontrolledTooltip
                        placement="top"
                        target={`delRolBtn-${role.id}`}
                      >
                        Delete Role
                      </UncontrolledTooltip>
                    </ControlledButtonWithConfirmation>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
}

export default withAllowedPolicies([POLICIES.ADMIN_VIEW])(RoleList);
