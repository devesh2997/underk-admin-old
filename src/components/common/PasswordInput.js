import React, { useState } from "react";
import { InputGroup, Input, InputGroupAddon, InputGroupText } from "reactstrap";

function PasswordInput({
  value,
  onChange,
  ...props
}) {
  const [isPasswordVisible, setPasswordVisibility] = useState(false);

  return (
    <InputGroup>
      <Input
        type={isPasswordVisible ? "text" : "password"}
        name="password"
        value={value}
        onChange={onChange}
        {...props}
      />
      <InputGroupAddon addonType="append">
        <InputGroupText
          onClick={() => setPasswordVisibility(!isPasswordVisible)}
        >
          {isPasswordVisible ? (
            <i className="fa fa-eye-slash"></i>
          ) : (
            <i className="fa fa-eye"></i>
          )}
        </InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}

export default PasswordInput;
