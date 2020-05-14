import { Policy } from "../models";
import { URLS, HTTPMethods } from "../constants";
import { stringify, arrify } from "../utils";

export default class PolicyRepository {
  constructor(request) {
    const _request = request;

    this.getById = (id) => {
      return this.get({ id });
    };

    this.getByName = (name) => {
      return this.get({ name });
    };

    this.get = async (params) => {
      try {
        const response = await _request({
          method: HTTPMethods.GET,
          url: URLS.POLICY_GET_URL,
          params,
        });
        return new Policy(response.policy);
      } catch (error) {
        throw error;
      }
    };

    this.getAll = async () => {
      try {
        const response = await _request({
          method: HTTPMethods.GET,
          url: URLS.POLICY_GET_ALL_URL,
        });
        return arrify(response.policies).map((policy) => new Policy(policy));
      } catch (error) {
        throw error;
      }
    };

    this.create = async ({ name, description }) => {
      try {
        const response = await _request({
          method: HTTPMethods.POST,
          url: URLS.POLICY_CREATE_URL,
          data: {
            name,
            description,
          },
        });
        // return new Policy(response.policy);
        return stringify(response.message);
      } catch (error) {
        throw error;
      }
    };

    this.delete = async (id) => {
      try {
        const response = await _request({
          method: HTTPMethods.DELETE,
          url: URLS.POLICY_DELETE_URL,
          params: {
            id,
          },
        });
        return stringify(response.message);
      } catch (error) {
        throw error;
      }
    };
  }
}
