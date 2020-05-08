import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { AuthContext } from './AuthProvider';

const withAuthorization = (locWhenAuthenticated, locWhenUnauthenticated) => Component => {
	function AuthorizationWrapperComponent(props) {
    const Auth = useContext(AuthContext);
    const history = useHistory();

    useEffect(() => {
      if(Auth.user) {
        if(locWhenAuthenticated) history.replace(locWhenAuthenticated);
      } else {
        if(locWhenUnauthenticated) history.replace(locWhenUnauthenticated);
      }
    }, [Auth]);

    return <Component {...props} />;
	}

	return AuthorizationWrapperComponent;
};

export default withAuthorization;
