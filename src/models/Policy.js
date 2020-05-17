import { objectify, stringify, numify } from "../utils";

export default class Policy {
  constructor(policy) {
    policy = objectify(policy);

    this.id = numify(policy.id);
    this.name = stringify(policy.name);
    this.description = stringify(policy.description);
  }

  toMapForSelectableOpt = () => {
    return {
      value: this.id,
      label: this.name,
    };
  };
}
