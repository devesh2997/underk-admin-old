import React, { useContext, useEffect, useState } from "react";

import { AuthUserContext } from "./AuthUserProvider";
import { doPoliciesMatch } from "../utils";

const withAllowedPolicies = (allowedPolicies) => (Component) => {
  function PolicyWrapperComponent(props) {
    const authUser = useContext(AuthUserContext);

    const [isRenderAllowed, setPermissionToRender] = useState(false);

    useEffect(() => {
      if (
        authUser.data &&
        doPoliciesMatch(authUser.data.policies, allowedPolicies)
      ) {
        setPermissionToRender(true);
      } else {
        setPermissionToRender(false);
      }
    }, [authUser]);

    return isRenderAllowed ? <Component {...props} /> : null;
  }

  return PolicyWrapperComponent;
};

export default withAllowedPolicies;
