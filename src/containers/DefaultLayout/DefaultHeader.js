import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Badge, DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem } from 'reactstrap';
import PropTypes from 'prop-types';

import { AppAsideToggler, AppHeaderDropdown, AppNavbarBrand, AppSidebarToggler } from '@coreui/react';

import logo1 from '../../assets/img/brand/logo1.png'
import logo2 from '../../assets/img/brand/logo2.png'

const propTypes = {
	children: PropTypes.node,
};

const defaultProps = {};

function DefaultHeader(props) {
  // eslint-disable-next-line
  const { children, ...attributes } = props;

  return (
    <React.Fragment>
      <AppSidebarToggler className="d-lg-none" display="md" mobile />
      <AppNavbarBrand
        full={{ src: logo2, width: 109.5, height: 25, alt: 'underK Logo' }}
        minimized={{ src: logo1, width: 45, height: 45, alt: 'underK Logo' }}
      />
      <AppSidebarToggler className="d-md-down-none" display="lg" />

      {/* <Nav className="d-md-down-none" navbar>
        <NavItem className="px-3">
          <NavLink to="/dashboard" className="nav-link" >Dashboard</NavLink>
        </NavItem>
        <NavItem className="px-3">
          <Link to="/users" className="nav-link">Users</Link>
        </NavItem>
        <NavItem className="px-3">
          <Link to="/strategies" className="nav-link">Strategies</Link>
        </NavItem>
        <NavItem className="px-3">
          <Link to="/landing-widgets" className="nav-link">Mobile Home Widgets</Link>
        </NavItem>
        <NavItem className="px-3">
          <NavLink to="#" className="nav-link">Settings</NavLink>
        </NavItem>
      </Nav> */}
      <Nav className="ml-auto" navbar>
        {/* <NavItem className="d-md-down-none">
          <NavLink to="#" className="nav-link"><i className="icon-bell"></i><Badge pill color="danger">5</Badge></NavLink>
        </NavItem>
        <NavItem className="d-md-down-none">
          <NavLink to="#" className="nav-link"><i className="icon-list"></i></NavLink>
        </NavItem>
        <NavItem className="d-md-down-none">
          <NavLink to="#" className="nav-link"><i className="icon-location-pin"></i></NavLink>
        </NavItem> */}
        <AppHeaderDropdown direction="down">
          <DropdownToggle nav>
            <img src={'../../assets/img/logo.png'} className="img-avatar" alt="admin@bootstrapmaster.com" />
          </DropdownToggle>
          <DropdownMenu right style={{ right: 'auto' }}>
            {/* <DropdownItem header tag="div" className="text-center"><strong>Account</strong></DropdownItem>
            <DropdownItem><i className="fa fa-bell-o"></i> Updates<Badge color="info">42</Badge></DropdownItem>
            <DropdownItem><i className="fa fa-envelope-o"></i> Messages<Badge color="success">42</Badge></DropdownItem>
            <DropdownItem><i className="fa fa-tasks"></i> Tasks<Badge color="danger">42</Badge></DropdownItem>
            <DropdownItem><i className="fa fa-comments"></i> Comments<Badge color="warning">42</Badge></DropdownItem>
            <DropdownItem header tag="div" className="text-center"><strong>Settings</strong></DropdownItem>
            <DropdownItem><i className="fa fa-wrench"></i> Settings</DropdownItem>
            <DropdownItem><i className="fa fa-usd"></i> Payments<Badge color="secondary">42</Badge></DropdownItem>
            <DropdownItem><i className="fa fa-file"></i> Projects<Badge color="primary">42</Badge></DropdownItem>
            <DropdownItem divider />
            <DropdownItem><i className="fa fa-shield"></i> Lock Account</DropdownItem> */}
            <DropdownItem><i className="fa fa-user"></i> Profile</DropdownItem>
            <DropdownItem onClick={props.onLogout}><i className="fa fa-lock"></i> Logout</DropdownItem>
          </DropdownMenu>
        </AppHeaderDropdown>
      </Nav>
      {/* <AppAsideToggler className="d-md-down-none" /> */}
      {/* <AppAsideToggler className="d-lg-none" mobile /> */}
    </React.Fragment>
  );
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
