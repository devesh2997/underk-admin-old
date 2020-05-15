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
import Select from "react-select";
import makeAnimated from "react-select/animated";

import { AdminRepository } from "../../data";
import { AuthUserContext, withAllowedPolicies } from "../../session";

function NewAdminForm({ isOpen, toggle, roles, policies }) {
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
        roleIds: JSON.stringify(roleIds.map((option) => option.value)),
        policyIds: JSON.stringify(policyIds.map((option) => option.value)),
      });
      toggle();
    } catch (error) {
      isMounted.current && setError(error);
    }
    isMounted.current && toggleLoading(false);
  }

  return (
    <Collapse isOpen={isOpen}>
      <Form onSubmit={onSubmit}>
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
          <Input
            type="password"
            name="password"
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
            options={roles.map((role) => ({
              value: role.id,
              label: role.name,
            }))}
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
            options={policies.map((policy) => ({
              value: policy.id,
              label: policy.name,
            }))}
            value={policyIds}
            onChange={(value) => setPolicyIds(value)}
          />
        </FormGroup>
        {error && <Alert color="danger">{error.message}</Alert>}
        <FormGroup>
          <Button type="submit" color="primary" disabled={isLoading}>
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

export default withAllowedPolicies([POLICIES.ADMIN_PUBLISH])(NewAdminForm);
