import { Policy } from "../models";
import { URLS, HTTP_METHODS, EVENTS, REPO_CHANGES } from "../constants";
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
          method: HTTP_METHODS.GET,
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
          method: HTTP_METHODS.GET,
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
          method: HTTP_METHODS.POST,
          url: URLS.POLICY_CREATE_URL,
          data: {
            name,
            description,
          },
        });
        this.triggerStateChange(REPO_CHANGES.POLICY_CREATE);
        // return new Policy(response.policy);
        return stringify(response.message);
      } catch (error) {
        throw error;
      }
    };

    this.delete = async (id) => {
      try {
        const response = await _request({
          method: HTTP_METHODS.DELETE,
          url: URLS.POLICY_DELETE_URL,
          params: {
            id,
          },
        });
        this.triggerStateChange(REPO_CHANGES.POLICY_DELETE);
        return stringify(response.message);
      } catch (error) {
        throw error;
      }
    };

    this.triggerStateChange = (changeType) => {
      const event = new CustomEvent(EVENTS.POLICY_STATE_CHANGE, {
        detail: changeType,
      });
      window.dispatchEvent(event);
    };
  }
}
