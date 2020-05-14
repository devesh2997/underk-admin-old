import { objectify, stringify, arrify } from "../utils";
import Policy from "./Policy";
import Role from "./Role";

export default class Admin {
  constructor(admin) {
    admin = objectify(admin);

    this.auid = stringify(admin.auid);
    this.alias = stringify(admin.alias);
    this.employee = null;
    this.roles = arrify(admin.roles).map((role) => new Role(role));
    this.policies = arrify(admin.policies).map((policy) => new Policy(policy));
    this.createdAt = stringify(admin.created_at);
  }
}
