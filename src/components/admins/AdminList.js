import React, { useState, useRef, useEffect, useContext } from "react";
import { Card, CardBody, CardHeader, Spinner, Table } from "reactstrap";
import * as POLICIES from "underk-policies";

import { AdminRepository, RoleRepository, PolicyRepository } from "../../data";
import { AuthUserContext, withAllowedPolicies } from "../../session";
import AdminItem from "./AdminItem";

function AdminList(props) {
  const isMounted = useRef(true);
  const adminRepository = useRef(null);
  const roleRepository = useRef(null);
  const policyRepository = useRef(null);

  const authUser = useContext(AuthUserContext);

  const [isLoading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    adminRepository.current = new AdminRepository(authUser.makeRequest);
    roleRepository.current = new RoleRepository(authUser.makeRequest);
    policyRepository.current = new PolicyRepository(authUser.makeRequest);
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
      const admins = await adminRepository.current.getAll();
      isMounted.current && setAdmins(admins);
    } catch (error) {
      console.log(error);
    }
    isMounted.current && setLoading(false);
  }

  async function getRoles() {
    try {
      const roles = await roleRepository.current.getAll();
      isMounted.current && setRoles(roles);
    } catch (error) {
      console.log(error);
    }
  }

  async function getPolicies() {
    try {
      const policies = await policyRepository.current.getAll();
      isMounted.current && setPolicies(policies);
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteAdmin(auid) {
    let message = "";
    try {
      message = await adminRepository.current.deleteById(auid);
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
        <h4>Admins</h4>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <center>
            <Spinner type="grow" color="primary" />
          </center>
        ) : (
          <Table
            hover
            responsive
            className="table-outline mb-0 d-none d-sm-table"
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
