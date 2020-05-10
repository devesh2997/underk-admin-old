import React, { useContext, useEffect, useState } from "react";
import * as POLICIES from "underk-policies";

import { AuthUserContext } from "./AuthUserProvider";
import Page404 from "../views/Pages/Page404";

const withPolicyMatch = (Component) => {
  function PolicyWrapperComponent(props) {
    const authUser = useContext(AuthUserContext);

    const [isViewAllowed, setPermissionToView] = useState(false);
    const [isPublishAllowed, setPermissionToPublish] = useState(false);

    useEffect(() => {
      if (authUser.data) {
        if (authUser.data.policies.includes(POLICIES.SUPER)) {
          setPermissionToView(true);
          setPermissionToPublish(true);
        } else if (
          props.policyReqToView &&
          authUser.data.policies.includes(props.policyReqToView)
        ) {
          setPermissionToView(true);
          if (
            props.policyReqToPublish &&
            authUser.data.policies.includes(props.policyReqToPublish)
          ) {
            setPermissionToPublish(true);
          }
        }
      }
    }, [authUser]);

    if (!isViewAllowed) {
      return <Page404 {...props} />;
    }

    return <Component {...props} isPublishAllowed={isPublishAllowed} />;
  }

  return PolicyWrapperComponent;
};

export default withPolicyMatch;
