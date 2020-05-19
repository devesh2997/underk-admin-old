import React, { useState, useRef, useEffect } from "react";

import LoadingButton from "./LoadingButton";

function ConfirmationButton({
  confirmationText,
  onConfirmation,
  children,
  ...props
}) {
  let isMounted = useRef(true);

  const [isLoading, toggleLoading] = useState(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <LoadingButton
      isLoading={isLoading}
      onClick={async () => {
        isMounted.current && toggleLoading(true);
        const isConfirmed = window.confirm(confirmationText);
        if (isConfirmed) {
          await onConfirmation();
        }
        isMounted.current && toggleLoading(false);
      }}
      {...props}
    >
      {children}
    </LoadingButton>
  );
}

export default ConfirmationButton;
