import { Role } from "../models";
import { URLS, HTTPMethods } from "../constants";
import { stringify, arrify } from "../utils";

export default class RoleRepository {
  constructor(request) {
    const _request = request;

    this.get = async (id) => {
      try {
        const response = await _request({
          method: HTTPMethods.GET,
          url: URLS.ROLE_GET_URL,
          params: {
            id,
          },
        });
        return new Role(response.role);
      } catch (error) {
        throw error;
      }
    };

    this.getAll = async () => {
      try {
        const response = await _request({
          method: HTTPMethods.GET,
          url: URLS.ROLE_GET_ALL_URL,
        });
        return arrify(response.roles).map((role) => new Role(role));
      } catch (error) {
        throw error;
      }
    };

    this.create = async ({ id, name, description, policyIds }) => {
      try {
        const response = await _request({
          method: HTTPMethods.POST,
          url: URLS.ROLE_CREATE_URL,
          data: {
            id,
            name,
            description,
            policyIds,
          },
        });
        // return new Role(response.role);
        return stringify(response.message);
      } catch (error) {
        throw error;
      }
    };

    this.delete = async (id) => {
      try {
        const response = await _request({
          method: HTTPMethods.DELETE,
          url: URLS.ROLE_DELETE_URL,
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
