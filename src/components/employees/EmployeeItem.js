import React from "react";
import { UncontrolledTooltip } from "reactstrap";
import * as POLICIES from "underk-policies";

import { beautifyDate } from "../../utils";
import { withAllowedPolicies } from "../../session";
import { ConfirmationButton } from "../common";

const ControlledConfirmationButton = withAllowedPolicies([
  POLICIES.EMPLOYEE_PUBLISH,
])(ConfirmationButton);

function EmployeeItem({ employee, deleteEmployee }) {
  return (
    <tr>
      <td>
        <div>{employee.fullName}</div>
        <div className="small text-muted">
          Gender: {employee.gender}, DOB: {beautifyDate(employee.dob)}
        </div>
      </td>
      <td className="text-center">
        {employee.email}
      </td>
      <td className="text-center">
        {employee.phoneNumber}
      </td>
      <td className="text-center">
        {employee.address}
      </td>
      <td className="text-right">
        <ControlledConfirmationButton
          id={`delEmpBtn-${employee.euid}`}
          type="button"
          color="danger"
          icon="fa fa-trash"
          confirmationText={`Are you sure you want to remove ${employee.fullName} from Employees?`}
          onConfirmation={() => deleteEmployee(employee.euid)}
        >
          <UncontrolledTooltip
            placement="top"
            target={`delEmpBtn-${employee.euid}`}
          >
            Delete Employee
          </UncontrolledTooltip>
        </ControlledConfirmationButton>
      </td>
    </tr>
  );
}

export default EmployeeItem;
