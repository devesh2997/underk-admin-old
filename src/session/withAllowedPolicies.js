import React, { useContext, useEffect, useState, useRef } from "react";

import { AuthUserContext } from "./AuthUserProvider";
import { doPoliciesMatch } from "../utils";

const withAllowedPolicies = (allowedPolicies) => (Component) => {
  function PolicyWrapperComponent(props) {
    let isMounted = useRef(true);

    const authUser = useContext(AuthUserContext);

    const [shouldRender, toggleRender] = useState(false);

    useEffect(() => {
      if (
        authUser.data &&
        doPoliciesMatch(authUser.data.policies, allowedPolicies)
      ) {
        isMounted.current && toggleRender(true);
      } else {
        isMounted.current && toggleRender(false);
      }

      // return () => {
      //   isMounted.current && toggleRender(false);
      // };
    }, [authUser]);

    useEffect(() => {
      return () => {
        isMounted.current = false;
      };
    }, []);

    return shouldRender ? <Component {...props} /> : null;
  }

  return PolicyWrapperComponent;
};

export default withAllowedPolicies;
