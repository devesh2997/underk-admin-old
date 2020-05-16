import React from "react";
import { Button } from "reactstrap";

function LoadingButton({
  label = "Save",
  loadingText = "Processing",
  isLoading,
  showCheck = true,
  ...props
}) {
  return (
    <Button {...props} disabled={isLoading}>
      {isLoading ? (
        <span>
          <i className="fa fa-refresh fa-spin fa-fw" /> {loadingText}
        </span>
      ) : (
        <span>{showCheck && <i className="fa fa-check" />} Save</span>
      )}
    </Button>
  );
}

export default LoadingButton;
