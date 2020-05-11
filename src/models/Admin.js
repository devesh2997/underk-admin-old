import { objectify, stringify, arrify, numify } from "../utils";
import { URLS } from "../constants";

export class Policy {
  constructor(policy) {
    policy = objectify(policy);

    this.id = numify(policy.id);
    this.name = stringify(policy.name);
    this.description = stringify(policy.description);
  }
}

export class Role {
  constructor(role) {
    role = objectify(role);

    this.id = numify(role.id);
    this.name = stringify(role.name);
    this.description = stringify(role.description);
    this.policies = arrify(role.policies).map((policy) => new Policy(policy));
  }
}

export class Admin {
  constructor(admin) {
    admin = objectify(admin);

    this.auid = stringify(admin.auid);
    this.alias = stringify(admin.alias);
    this.employee = null;
    this.roles = arrify(admin.roles).map((role) => new Role(role));
    this.policies = arrify(admin.policies).map((policy) => new Policy(policy));
    this.createdAt = stringify(admin.created_at);
  }

  delete = async (params, authUser) => {
    try {
      const response = await authUser.makeRequest({
        method: "DELETE",
        url: URLS.ADMIN_DELETE_URL,
        params,
      });
      return response.message;
    } catch (error) {
      throw error;
    }
  };
}

Admin.get = async (params, authUser) => {
  try {
    const response = await authUser.makeRequest({
      method: "GET",
      url: URLS.ADMIN_GET_URL,
      params,
    });
    return new Admin(response.admin);
  } catch (error) {
    throw error;
  }
};

Admin.getAll = async (authUser) => {
  try {
    const response = await authUser.makeRequest({
      method: "GET",
      url: URLS.ADMIN_GET_ALL_URL,
    });
    return response.admins.map((admin) => new Admin(admin));
  } catch (error) {
    throw error;
  }
};

Admin.create = async (data, authUser) => {
  try {
    const response = await authUser.makeRequest({
      method: "POST",
      url: URLS.ADMIN_CREATE_URL,
      data,
    });
    // return new Admin(response.admin);
    return response.message;
  } catch (error) {
    throw error;
  }
};
