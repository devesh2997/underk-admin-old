import React, { Component } from 'react';
import { withFirebase } from '../firebase';
import { compose } from 'recompose';
import { Switch, Route } from 'react-router-dom';

import * as ROLES from '../constants/roles';
import { withAuthorization, withEmailVerification } from '../session';
import { adminRoutes as ROUTES } from '../constants/routes';


const Dashboard = () => (
	<div>
		Dashboard
	</div>
);


export default withFirebase(Dashboard);

