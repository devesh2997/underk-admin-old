import React, { useState, useRef, useEffect, useContext } from "react";
import { Card, CardBody, CardHeader, Spinner, Table } from "reactstrap";
import * as POLICIES from "underk-policies";

import { Admin, Role, Policy } from "../../models";
import { AuthUserContext, withAllowedPolicies } from "../../session";
import AdminItem from "./AdminItem";

function AdminList(props) {
  const isMounted = useRef(true);

  const authUser = useContext(AuthUserContext);

  const [isLoading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    getAdmins();
    getRoles();
    getPolicies();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const getAdmins = async () => {
    isMounted.current && setLoading(true);
    try {
      const admins = await Admin.getAll(authUser);
      isMounted.current && setAdmins(admins);
    } catch (error) {
      console.log(error);
    }
    isMounted.current && setLoading(false);
  };

  const getRoles = async () => {
    try {
      const roles = await Role.getAll(authUser);
      isMounted.current && setRoles(roles);
    } catch (error) {
      console.log(error);
    }
  };

  const getPolicies = async () => {
    try {
      const policies = await Policy.getAll(authUser);
      isMounted.current && setPolicies(policies);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteAdmin = async (auid) => {
    let message = "";
    try {
      message = await Admin.delete({ auid }, authUser);
      await getAdmins();
    } catch (error) {
      message = error.message;
    }
    // TODO: display message
    console.log(message);
  };

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
