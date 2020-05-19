import React, { useState, useEffect, useRef } from "react";
import { Badge, Button, UncontrolledTooltip, Collapse } from "reactstrap";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import * as POLICIES from "underk-policies";

import { beautifyDate } from "../../utils";
import { withAllowedPolicies } from "../../session";
import { ConfirmationButton } from "../common";

const ControlledConfirmationButton = withAllowedPolicies([
  POLICIES.ADMIN_PUBLISH,
])(ConfirmationButton);

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
        <ControlledConfirmationButton
          id={`delAdmBtn-${admin.auid}`}
          type="button"
          color="danger"
          icon="fa fa-trash"
          confirmationText={`Are you sure you want to remove ${admin.alias} from Admins?`}
          onConfirmation={() => deleteAdmin(admin.auid)}
        >
          <UncontrolledTooltip
            placement="top"
            target={`delAdmBtn-${admin.auid}`}
          >
            Delete Admin
          </UncontrolledTooltip>
        </ControlledConfirmationButton>
      </td>
    </tr>
  );
}

export default AdminItem;
