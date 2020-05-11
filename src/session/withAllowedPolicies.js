import React, { useContext, useEffect, useState, useRef } from "react";

import { AuthUserContext } from "./AuthUserProvider";
import { doPoliciesMatch } from "../utils";

const withAllowedPolicies = (allowedPolicies) => (Component) => {
  function PolicyWrapperComponent(props) {
    let isMounted = useRef(true);

    const authUser = useContext(AuthUserContext);

    const [isRenderAllowed, setPermissionToRender] = useState(false);

    useEffect(() => {
      if (
        authUser.data &&
        doPoliciesMatch(authUser.data.policies, allowedPolicies)
      ) {
        isMounted.current && setPermissionToRender(true);
      } else {
        isMounted.current && setPermissionToRender(false);
      }

      // return () => {
      //   isMounted.current && setPermissionToRender(false);
      // };
    }, [authUser]);

    useEffect(() => {
      return () => {
        isMounted.current = false;
      };
    }, []);

    return isRenderAllowed ? <Component {...props} /> : null;
  }

  return PolicyWrapperComponent;
};

export default withAllowedPolicies;
