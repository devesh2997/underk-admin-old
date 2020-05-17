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
} from "reactstrap";
import * as POLICIES from "underk-policies";

import { PolicyRepository } from "../../data";
import { AuthUserContext, withAllowedPolicies } from "../../session";
import NewPolicyForm from "./NewPolicyForm";
import { EVENTS } from "../../constants";
import { ButtonWithConfirmation } from "../common";

const ControlledButton = withAllowedPolicies([POLICIES.ADMIN_PUBLISH])(Button);
const ControlledButtonWithConfirmation = withAllowedPolicies([
  POLICIES.ADMIN_PUBLISH,
])(ButtonWithConfirmation);

function PolicyList(props) {
  const isMounted = useRef(true);

  const authUser = useContext(AuthUserContext);

  const policyRepository = new PolicyRepository(authUser.doRequest);

  const [isLoading, setLoading] = useState(true);
  const [policies, setPolicies] = useState([]);
  const [isFormOpen, toggleForm] = useState(false);

  useEffect(() => {
    getPolicies();
    window.addEventListener(EVENTS.POLICY_STATE_CHANGE, getPolicies);

    return () => {
      window.removeEventListener(EVENTS.POLICY_STATE_CHANGE, getPolicies);
      isMounted.current = false;
    };
  }, []);

  async function getPolicies() {
    isMounted.current && setLoading(true);
    try {
      const policies = await policyRepository.getAll();
      isMounted.current && setPolicies(policies);
    } catch (error) {
      console.log(error);
    }
    isMounted.current && setLoading(false);
  }

  async function deletePolicy(id) {
    let message = "";
    try {
      message = await policyRepository.delete(id);
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
            <h4>Policies</h4>
          </Col>
          <Col sm={6} className="text-right">
            <ControlledButton
              type="button"
              color="secondary"
              onClick={() => toggleForm(!isFormOpen)}
            >
              <i className="fa fa-plus" /> New Policy
            </ControlledButton>
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        <NewPolicyForm
          isFormOpen={isFormOpen}
          toggleForm={() => toggleForm(!isFormOpen)}
        />
        {isLoading ? (
          <center>
            <Spinner type="grow" color="primary" />
          </center>
        ) : (
          <Table hover responsive className="table-outline mb-0">
            <thead className="thead-light">
              <tr>
                <th>Policy</th>
                <th className="text-center">Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => (
                <tr key={policy.id}>
                  <td>{policy.name}</td>
                  <td className="text-center">{policy.description}</td>
                  <td>
                    <ControlledButtonWithConfirmation
                      id={`delPolBtn-${policy.id}`}
                      type="button"
                      color="danger"
                      icon="fa fa-trash"
                      confirmationText={`Are you sure you want to delete the policy ${policy.name}?`}
                      onConfirmation={() => deletePolicy(policy.id)}
                    >
                      <UncontrolledTooltip
                        placement="top"
                        target={`delPolBtn-${policy.id}`}
                      >
                        Delete Policy
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

export default withAllowedPolicies([POLICIES.ADMIN_VIEW])(PolicyList);
