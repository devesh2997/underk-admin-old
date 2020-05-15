import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Collapse,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
} from "reactstrap";
import * as POLICIES from "underk-policies";

import { PolicyRepository } from "../../data";
import { AuthUserContext, withAllowedPolicies } from "../../session";

function NewPolicyForm({ isOpen, toggle }) {
  const isMounted = useRef(true);

  const authUser = useContext(AuthUserContext);

  const policyRepository = new PolicyRepository(authUser.doRequest);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, toggleLoading] = useState(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    isMounted.current && toggleLoading(true);
    try {
      await policyRepository.create({ name, description });
      toggle();
    } catch (error) {
      isMounted.current && setError(error);
    }
    isMounted.current && toggleLoading(false);
  }

  return (
    <Collapse isOpen={isOpen}>
      <Form onSubmit={onSubmit}>
        <h5>New Policy</h5>
        <FormGroup>
          <Label>Name</Label>
          <Input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>Description</Label>
          <Input
            type="text"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            // required
          />
        </FormGroup>
        {error && <Alert color="danger">{error.message}</Alert>}
        <FormGroup>
          <Button
            type="submit"
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <i className="fa fa-refresh fa-spin fa-fw" />
            ) : (
              <span>
                <i className="fa fa-check" /> Save
              </span>
            )}
          </Button>
        </FormGroup>
      </Form>
    </Collapse>
  );
}

export default withAllowedPolicies([POLICIES.ADMIN_PUBLISH])(NewPolicyForm);
