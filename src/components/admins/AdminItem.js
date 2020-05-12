import React, { useState, useEffect, useRef } from "react";
import { Badge, Button, UncontrolledTooltip, Collapse } from "reactstrap";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import * as POLICIES from "underk-policies";

import { beautifyDate } from "../../utils";
import { withAllowedPolicies } from "../../session";

function AdminDeleteBtn({ admin, deleteAdmin }) {
  let isMounted = useRef(true);

  const [isLoading, toggleLoading] = useState(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const onClick = async () => {
    isMounted.current && toggleLoading(true);
    const isConfirmed = window.confirm(
      `Are you sure you want to remove ${admin.alias} from Admins?`
    );
    if (isConfirmed) {
      await deleteAdmin(admin.auid);
    }
    isMounted.current && toggleLoading(false);
  };

  return (
    <Button
      id={`delAdmBtn-${admin.auid}`}
      type="button"
      color="danger"
      style={{ margin: 3 }}
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <i className="fa fa-refresh fa-spin fa-fw" />
      ) : (
        <i className="fa fa-trash" />
      )}
      <UncontrolledTooltip placement="top" target={`delAdmBtn-${admin.auid}`}>
        Delete Admin
      </UncontrolledTooltip>
    </Button>
  );
}

const ControlledAdminDeleteBtn = withAllowedPolicies([POLICIES.ADMIN_PUBLISH])(
  AdminDeleteBtn
);

function AdminItem({ admin, roles, policies, deleteAdmin }) {
  // const [isOpen1, setIsOpen1] = useState(false);
  // const [isOpen2, setIsOpen2] = useState(false);

  return (
    <tr>
      <td>
        <div>{admin.alias}</div>
        <div className="small text-muted">
          Created At: {beautifyDate(admin.createdAt)}
        </div>
      </td>
      <td className="text-center">
        {admin.roles.map((role) => (
          <Badge key={role.id} color="info" pill style={{ margin: 3 }}>
            {role.name}
          </Badge>
        ))}
        {/* <div>
          <Button
            id={`editRolBtn-${admin.auid}`}
            type="button"
            color="secondary"
            style={{ margin: 5, borderRadius: "50%" }}
            onClick={() => setIsOpen1(!isOpen1)}
          >
            <i className="fa fa-pencil" />
            <UncontrolledTooltip
              placement="top"
              target={`editRolBtn-${admin.auid}`}
            >
              Edit Roles
            </UncontrolledTooltip>
          </Button>
        </div>
        <Collapse isOpen={isOpen1}>
          <Select
            closeMenuOnSelect={false}
            components={makeAnimated()}
            isMulti
            options={roles.map((role) => ({
              value: role.id,
              label: role.name,
            }))}
            defaultValue={[]}
          />
        </Collapse> */}
      </td>
      <td className="text-center">
        {admin.policies.map((policy) => (
          <Badge key={policy.id} color="info" pill style={{ margin: 3 }}>
            {policy.name}
          </Badge>
        ))}
        {/* <div>
          <Button
            id={`editPolBtn-${admin.auid}`}
            type="button"
            color="secondary"
            style={{ margin: 5, borderRadius: "50%" }}
            onClick={() => setIsOpen2(!isOpen2)}
          >
            <i className="fa fa-pencil" />
            <UncontrolledTooltip
              placement="top"
              target={`editPolBtn-${admin.auid}`}
            >
              Edit Policies
            </UncontrolledTooltip>
          </Button>
        </div>
        <Collapse isOpen={isOpen2}>
          <Select
            closeMenuOnSelect={false}
            components={makeAnimated()}
            isMulti
            options={policies.map((policy) => ({
              value: policy.id,
              label: policy.name,
            }))}
            defaultValue={[]}
          />
        </Collapse> */}
      </td>
      <td>
        <Button
          id={`viewEmpBtn-${admin.auid}`}
          type="button"
          color="primary"
          style={{ margin: 3 }}
        >
          <i className="fa fa-file-text" />
          <UncontrolledTooltip
            placement="top"
            target={`viewEmpBtn-${admin.auid}`}
          >
            View Employee Profile
          </UncontrolledTooltip>
        </Button>
        <ControlledAdminDeleteBtn admin={admin} deleteAdmin={deleteAdmin} />
      </td>
    </tr>
  );
}

export default AdminItem;
