const baseURL = 'http://localhost:400/v1';
const adminApp = '/admin';

export const ADMIN_LOGIN_URL = baseURL + '/admin-login';

export const ADMIN_GET_URL = baseURL + adminApp;
export const ADMIN_GET_ALL_URL = baseURL + adminApp + '/all';
export const ADMIN_DELETE_URL = baseURL + adminApp;
export const ADMIN_CREATE_URL = baseURL + adminApp;

export const POLICY_GET_URL = baseURL + adminApp + '/policy';
export const POLICY_GET_ALL_URL = baseURL + adminApp + '/policies';
export const POLICY_DELETE_URL = baseURL + adminApp + '/policy';
export const POLICY_CREATE_URL = baseURL + adminApp + '/policy';

export const ROLE_GET_URL = baseURL + adminApp + '/role';
export const ROLE_GET_ALL_URL = baseURL + adminApp + '/roles';
export const ROLE_DELETE_URL = baseURL + adminApp + '/role';
export const ROLE_CREATE_URL = baseURL + adminApp + '/role';
