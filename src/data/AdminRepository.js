import { Admin } from "../models";
import { URLS, HTTPMethods } from "../constants";
import { stringify, arrify } from "../utils";

export default class AdminRepository {
  constructor(request) {
    const _request = request;

    this.getById = (auid) => {
      return this.get({ auid });
    };

    this.getByAlias = (alias) => {
      return this.get({ alias });
    };

    this.get = async (params) => {
      try {
        const response = await _request({
          method: HTTPMethods.GET,
          url: URLS.ADMIN_GET_URL,
          params,
        });
        return new Admin(response.admin);
      } catch (error) {
        throw error;
      }
    };

    this.getAll = async () => {
      try {
        const response = await _request({
          method: HTTPMethods.GET,
          url: URLS.ADMIN_GET_ALL_URL,
        });
        return arrify(response.admins).map((admin) => new Admin(admin));
      } catch (error) {
        throw error;
      }
    };

    this.create = async ({ alias, password, euid, policyIds, roleIds }) => {
      try {
        const response = await _request({
          method: HTTPMethods.POST,
          url: URLS.ADMIN_CREATE_URL,
          data: {
            alias,
            password,
            euid,
            policyIds,
            roleIds,
          },
        });
        // return new Admin(response.admin);
        return stringify(response.message);
      } catch (error) {
        throw error;
      }
    };

    this.deleteById = (auid) => {
      return this.delete({ auid });
    };

    this.deleteByAlias = (alias) => {
      return this.delete({ alias });
    };

    this.delete = async (params) => {
      try {
        const response = await _request({
          method: HTTPMethods.DELETE,
          url: URLS.ADMIN_DELETE_URL,
          params,
        });
        return stringify(response.message);
      } catch (error) {
        throw error;
      }
    };
  }
}
