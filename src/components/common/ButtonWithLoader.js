import React from "react";
import { Button } from "reactstrap";

function ButtonWithLoader({
  icon = null,
  label = null,
  loadingText = null,
  isLoading,
  children,
  ...props
}) {
  return (
    <Button {...props} disabled={isLoading}>
      {isLoading ? (
        <span>
          <i className="fa fa-refresh fa-spin fa-fw" /> {loadingText}
        </span>
      ) : (
        <span>
          {icon && <i className={icon} />} {label}
        </span>
      )}
      {children}
    </Button>
  );
}

export default ButtonWithLoader;
