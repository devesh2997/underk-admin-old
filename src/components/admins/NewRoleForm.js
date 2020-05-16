import React, { useState, useRef, useEffect, useContext } from "react";
import { Collapse, Form, FormGroup, Label, Input, Alert } from "reactstrap";
import * as POLICIES from "underk-policies";
import Select from "react-select";
import makeAnimated from "react-select/animated";

import { RoleRepository } from "../../data";
import { AuthUserContext, withAllowedPolicies } from "../../session";
import { LoadingButton } from "../common";
import { prepareMultiOptsForRequest } from "../../utils";

function NewRoleForm({ isFormOpen, toggleForm, policies }) {
  const isMounted = useRef(true);

  const authUser = useContext(AuthUserContext);

  const roleRepository = new RoleRepository(authUser.doRequest);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [policyIds, setPolicyIds] = useState([]);
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
      await roleRepository.create({
        name,
        description,
        policyIds: prepareMultiOptsForRequest(policyIds),
      });
      // TODO: getRoles()
      setInitialState();
      toggleForm();
    } catch (error) {
      isMounted.current && setError(error);
    }
    isMounted.current && toggleLoading(false);
  }

  function setInitialState() {
    setName("");
    setDescription("");
    setPolicyIds([]);
    setError(null);
  }

  return (
    <Collapse isOpen={isFormOpen}>
      <Form
        onSubmit={onSubmit}
        style={{
          padding: "1rem",
          marginBottom: "1rem",
          border: "1px solid #c8ced3",
        }}
      >
        <h5>New Role</h5>
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
        <FormGroup>
          <Label>Policies</Label>
          <Select
            closeMenuOnSelect={false}
            components={makeAnimated()}
            isMulti
            options={policies.map((policy) => policy.toSelectableOptMap())}
            value={policyIds}
            onChange={(value) => setPolicyIds(value)}
          />
        </FormGroup>
        {error && <Alert color="danger">{error.message}</Alert>}
        <FormGroup>
          <LoadingButton type="submit" color="primary" isLoading={isLoading} />
        </FormGroup>
      </Form>
    </Collapse>
  );
}

export default withAllowedPolicies([POLICIES.ADMIN_PUBLISH])(NewRoleForm);
