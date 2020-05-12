import { objectify, stringify, arrify, numify } from "../utils";
import { URLS } from "../constants";
import Policy from "./Policy";

export default class Role {
  constructor(role) {
    role = objectify(role);

    this.id = numify(role.id);
    this.name = stringify(role.name);
    this.description = stringify(role.description);
    this.policies = arrify(role.policies).map((policy) => new Policy(policy));
  }
}

Role.get = async (params, authUser) => {
  try {
    const response = await authUser.makeRequest({
      method: "GET",
      url: URLS.ROLE_GET_URL,
      params,
    });
    return new Role(response.role);
  } catch (error) {
    throw error;
  }
};

Role.getAll = async (authUser) => {
  try {
    const response = await authUser.makeRequest({
      method: "GET",
      url: URLS.ROLE_GET_ALL_URL,
    });
    return arrify(response.roles).map((role) => new Role(role));
  } catch (error) {
    throw error;
  }
};

Role.create = async (data, authUser) => {
  try {
    const response = await authUser.makeRequest({
      method: "POST",
      url: URLS.ROLE_CREATE_URL,
      data,
    });
    // return new Role(response.role);
    return stringify(response.message);
  } catch (error) {
    throw error;
  }
};

Role.delete = async (params, authUser) => {
  try {
    const response = await authUser.makeRequest({
      method: "DELETE",
      url: URLS.ROLE_DELETE_URL,
      params,
    });
    return stringify(response.message);
  } catch (error) {
    throw error;
  }
};
