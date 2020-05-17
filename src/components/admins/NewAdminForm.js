import React, { useState, useRef, useEffect, useContext } from "react";
import { Collapse, Form, FormGroup, Label, Input, Alert } from "reactstrap";
import * as POLICIES from "underk-policies";
import Select from "react-select";
import makeAnimated from "react-select/animated";

import { AdminRepository } from "../../data";
import { AuthUserContext, withAllowedPolicies } from "../../session";
import { PasswordInput, ButtonWithLoader } from "../common";
import { prepareMultiOptsForRequest } from "../../utils";

function NewAdminForm({ isFormOpen, toggleForm, roles, policies }) {
  const isMounted = useRef(true);

  const authUser = useContext(AuthUserContext);

  const adminRepository = new AdminRepository(authUser.doRequest);

  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [euid, setEuid] = useState("");
  const [roleIds, setRoleIds] = useState([]);
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
      await adminRepository.create({
        alias,
        password,
        euid: euid || undefined,
        roleIds: prepareMultiOptsForRequest(roleIds),
        policyIds: prepareMultiOptsForRequest(policyIds),
      });
      setInitialState();
      toggleForm();
    } catch (error) {
      isMounted.current && setError(error);
    }
    isMounted.current && toggleLoading(false);
  }

  function setInitialState() {
    setAlias("");
    setPassword("");
    setEuid("");
    setRoleIds([]);
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
        <h5>New Admin</h5>
        <FormGroup>
          <Label>Alias</Label>
          <Input
            type="text"
            name="alias"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="Enter alias"
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>Password</Label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>Employee Id</Label>
          <Input
            type="text"
            name="euid"
            value={euid}
            onChange={(e) => setEuid(e.target.value)}
            placeholder="Enter euid"
            // required
          />
        </FormGroup>
        <FormGroup>
          <Label>Roles</Label>
          <Select
            closeMenuOnSelect={false}
            components={makeAnimated()}
            isMulti
            options={roles.map((role) => role.toMapForSelectableOpt())}
            value={roleIds}
            onChange={(value) => setRoleIds(value)}
          />
        </FormGroup>
        <FormGroup>
          <Label>Policies</Label>
          <Select
            closeMenuOnSelect={false}
            components={makeAnimated()}
            isMulti
            options={policies.map((policy) => policy.toMapForSelectableOpt())}
            value={policyIds}
            onChange={(value) => setPolicyIds(value)}
          />
        </FormGroup>
        {error && <Alert color="danger">{error.message}</Alert>}
        <FormGroup>
          <ButtonWithLoader
            type="submit"
            color="primary"
            icon="fa fa-check"
            label="Save"
            loadingText="Processing"
            isLoading={isLoading}
          />
        </FormGroup>
      </Form>
    </Collapse>
  );
}

export default withAllowedPolicies([POLICIES.ADMIN_PUBLISH])(NewAdminForm);
