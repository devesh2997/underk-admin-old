import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { AuthContext } from './AuthProvider';

const withAuthorization = (locWhenAuth, locWhenUnauth) => Component => {
	function AuthorizationWrapperComponent(props) {
    const Auth = useContext(AuthContext);
    const history = useHistory();

    useEffect(() => {
      if(Auth.user) {
        if(locWhenAuth) history.replace(locWhenAuth);
      } else {
        if(locWhenUnauth) history.replace(locWhenUnauth);
      }
    }, [Auth]);

    return <Component {...props} />;
	}

	return AuthorizationWrapperComponent;
};

export default withAuthorization;
