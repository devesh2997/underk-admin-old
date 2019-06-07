import React, { Component } from 'react';
import { withFirebase } from '../firebase';
import { compose } from 'recompose';
import { Switch, Route, NavLink } from 'react-router-dom';

import * as ROLES from '../constants/roles';
import { withAuthorization, withEmailVerification } from '../session';
import { adminRoutes as ROUTES } from '../constants/routes';

import './app.css';

const AdminPanel = () => (
	<div className="admn_pnl-container">
		<h2 className="admn_pnl-primary_heading">Admin Panel</h2>
		<NavLink to={ROUTES.DASHBOARD.path} className="admn_pnl-nav_tabs">Dashboard</NavLink>
		<NavLink to={ROUTES.ADMINISTRATOR_LIST.path} className="admn_pnl-nav_tabs">Administrators</NavLink>
		<NavLink to={ROUTES.USER_LIST.path} className="admn_pnl-nav_tabs">Users</NavLink>
		<NavLink to={ROUTES.CATEGORY_LIST.path} className="admn_pnl-nav_tabs">Categories</NavLink>
		<NavLink to={ROUTES.SUPPLIER_LIST.path} className="admn_pnl-nav_tabs">Suppliers</NavLink>
		<NavLink to={ROUTES.PRODUCT_LIST.path} className="admn_pnl-nav_tabs">Products</NavLink>
		<Switch>
			{
				Object.values(ROUTES).map((route, idx) => {
					return route.component
						? (
							<Route key={idx}
								path={route.path}
								exact={route.exact}
								name={route.name}
								render={props => (<route.component {...props} />)}
							/>
						)
						: (null);
				})
			}
		</Switch>
	</div>
);


const condition = authUser => authUser && !!authUser.roles[ROLES.ADMIN];

export default compose(
	withEmailVerification,
	withAuthorization(condition),
	withFirebase,
)(AdminPanel);

