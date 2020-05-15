import React, { useState, useRef, useEffect, useContext } from "react";
import { Card, CardBody, CardHeader, Spinner, Table, Row, Col, Button } from "reactstrap";
import * as POLICIES from "underk-policies";

import { AdminRepository, RoleRepository, PolicyRepository } from "../../data";
import { AuthUserContext, withAllowedPolicies } from "../../session";
import AdminItem from "./AdminItem";
import NewPolicyForm from './NewPolicyForm';
import NewRoleForm from './NewRoleForm';
import NewAdminForm from './NewAdminForm';

function AdminList(props) {
  const isMounted = useRef(true);

  const authUser = useContext(AuthUserContext);

  const adminRepository = new AdminRepository(authUser.doRequest);
  const roleRepository = new RoleRepository(authUser.doRequest);
  const policyRepository = new PolicyRepository(authUser.doRequest);

  const [isLoading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [isPolicyFormOpen, togglePolicyForm] = useState(false);
  const [isRoleFormOpen, toggleRoleForm] = useState(false);
  const [isAdminFormOpen, toggleAdminForm] = useState(false);

  useEffect(() => {
    getAdmins();
    getRoles();
    getPolicies();

    return () => {
      isMounted.current = false;
    };
  }, []);

  async function getAdmins() {
    isMounted.current && setLoading(true);
    try {
      const admins = await adminRepository.getAll();
      isMounted.current && setAdmins(admins);
    } catch (error) {
      console.log(error);
    }
    isMounted.current && setLoading(false);
  }

  async function getRoles() {
    try {
      const roles = await roleRepository.getAll();
      isMounted.current && setRoles(roles);
    } catch (error) {
      console.log(error);
    }
  }

  async function getPolicies() {
    try {
      const policies = await policyRepository.getAll();
      isMounted.current && setPolicies(policies);
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteAdmin(auid) {
    let message = "";
    try {
      message = await adminRepository.deleteById(auid);
      await getAdmins();
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
          <Col sm={3}>
            <h4>Admins</h4>
          </Col>
          <Col sm={9} className="text-right">
            <Button
              type="button"
              color="secondary"
              style={{ margin: 3 }}
              onClick={() => togglePolicyForm(!isPolicyFormOpen)}
            >
              <i className="fa fa-plus" /> New Policy
            </Button>
            <Button
              type="button"
              color="secondary"
              style={{ margin: 3 }}
              onClick={() => toggleRoleForm(!isRoleFormOpen)}
            >
              <i className="fa fa-plus" /> New Role
            </Button>
            <Button
              type="button"
              color="secondary"
              style={{ margin: 3 }}
              onClick={() => toggleAdminForm(!isAdminFormOpen)}
            >
              <i className="fa fa-plus" /> New Admin
            </Button>
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        <NewPolicyForm
          isOpen={isPolicyFormOpen}
          toggle={() => togglePolicyForm(!isPolicyFormOpen)}
        />
        <NewRoleForm
          isOpen={isRoleFormOpen}
          toggle={() => toggleRoleForm(!isRoleFormOpen)}
          policies={policies}
        />
        <NewAdminForm
          isOpen={isAdminFormOpen}
          toggle={() => toggleAdminForm(!isAdminFormOpen)}
          roles={roles}
          policies={policies}
        />
        {isLoading ? (
          <center>
            <Spinner type="grow" color="primary" />
          </center>
        ) : (
          <Table
            hover
            responsive
            className="table-outline mb-0"
          >
            <thead className="thead-light">
              <tr>
                <th>Admin</th>
                <th className="text-center">Roles</th>
                <th className="text-center">Policies</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <AdminItem
                  key={admin.auid}
                  admin={admin}
                  roles={roles}
                  policies={policies}
                  deleteAdmin={deleteAdmin}
                />
              ))}
            </tbody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
}

export default withAllowedPolicies([POLICIES.ADMIN_VIEW])(AdminList);
