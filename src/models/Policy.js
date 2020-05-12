import { objectify, stringify, arrify, numify } from "../utils";
import { URLS } from "../constants";

export default class Policy {
  constructor(policy) {
    policy = objectify(policy);

    this.id = numify(policy.id);
    this.name = stringify(policy.name);
    this.description = stringify(policy.description);
  }
}

Policy.get = async (params, authUser) => {
  try {
    const response = await authUser.makeRequest({
      method: "GET",
      url: URLS.POLICY_GET_URL,
      params,
    });
    return new Policy(response.policy);
  } catch (error) {
    throw error;
  }
};

Policy.getAll = async (authUser) => {
  try {
    const response = await authUser.makeRequest({
      method: "GET",
      url: URLS.POLICY_GET_ALL_URL,
    });
    return arrify(response.policies).map((policy) => new Policy(policy));
  } catch (error) {
    throw error;
  }
};

Policy.create = async (data, authUser) => {
  try {
    const response = await authUser.makeRequest({
      method: "POST",
      url: URLS.POLICY_CREATE_URL,
      data,
    });
    // return new Policy(response.policy);
    return stringify(response.message);
  } catch (error) {
    throw error;
  }
};

Policy.delete = async (params, authUser) => {
  try {
    const response = await authUser.makeRequest({
      method: "DELETE",
      url: URLS.POLICY_DELETE_URL,
      params,
    });
    return stringify(response.message);
  } catch (error) {
    throw error;
  }
};
