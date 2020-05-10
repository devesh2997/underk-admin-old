import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { AuthUserContext } from "./AuthUserProvider";

const withAuthorization = (locWhenAuth, locWhenUnauth) => (Component) => {
  function AuthorizationWrapperComponent(props) {
    const authUser = useContext(AuthUserContext);
    const history = useHistory();

    useEffect(() => {
      if (authUser.data) {
        if (locWhenAuth) history.replace(locWhenAuth);
      } else {
        if (locWhenUnauth) history.replace(locWhenUnauth);
      }
    }, [authUser]);

    return <Component {...props} />;
  }

  return AuthorizationWrapperComponent;
};

export default withAuthorization;
