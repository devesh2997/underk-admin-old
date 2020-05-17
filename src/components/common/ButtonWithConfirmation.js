import React, { useState, useRef, useEffect } from "react";

import ButtonWithLoader from "./ButtonWithLoader";

function ButtonWithConfirmation({
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
    <ButtonWithLoader
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
    </ButtonWithLoader>
  );
}

export default ButtonWithConfirmation;
