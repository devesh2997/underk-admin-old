import { objectify, stringify, arrify, numify } from "../utils";
import Policy from "./Policy";

export default class Role {
  constructor(role) {
    role = objectify(role);

    this.id = numify(role.id);
    this.name = stringify(role.name);
    this.description = stringify(role.description);
    this.policies = arrify(role.policies).map((policy) => new Policy(policy));
  }

  toSelectableOptMap = () => {
    return {
      value: this.id,
      label: this.name,
    };
  };
}
