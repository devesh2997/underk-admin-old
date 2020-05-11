import React, { useState, useRef, useEffect, useContext } from "react";
import { Card, CardBody, CardHeader, Table } from "reactstrap";

import { Admin } from "../../models";
import { AuthUserContext } from "../../session";
import { timeStampToDateLocaleString } from '../../utils';

export default function AdminList(props) {
  const isMounted = useRef(true);

  const authUser = useContext(AuthUserContext);

  const [isLoading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    getAdmins();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const getAdmins = async () => {
    isMounted.current && setLoading(true);
    try {
      const adms = await Admin.getAll(authUser);
      isMounted.current && setAdmins(adms);
    } catch(error) {
      console.log(error);
    }
    isMounted.current && setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <h4>Admins</h4>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="animated fadeIn pt-3 text-center">Loading...</div>
        ) : null}
        <Table striped responsive>
          <thead>
            <tr>
              <th>Alias</th>
              <th>Created At</th>
              <th>Roles</th>
              <th>Policies</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.auid}>
                <td>{admin.alias}</td>
                <td>{timeStampToDateLocaleString(admin.createdAt)}</td>
                <td><pre>{JSON.stringify(admin.roles, null, 2)}</pre></td>
                <td><pre>{JSON.stringify(admin.policies, null, 2)}</pre></td>
                <td>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
}
