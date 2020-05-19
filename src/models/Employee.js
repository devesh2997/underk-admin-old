import { objectify, stringify, numify, boolify } from "../utils";

export default class Employee {
  constructor(employee) {
    employee = objectify(employee);

    this.euid = stringify(employee.euid);
    this.firstName = stringify(employee.firstName);
    this.lastName = stringify(employee.lastName);
    this.email = stringify(employee.email);
    this.mobileCountryCode = stringify(employee.mobileCountryCode);
    this.mobileNumber = numify(employee.mobileNumber);
    this.dob = numify(employee.dob);
    this.gender = stringify(employee.gender);
    this.picUrl = stringify(employee.picUrl);
    this.mobileVerified = boolify(employee.mobileVerified);
    this.emailVerified = boolify(employee.emailVerified);
    this.address = stringify(employee.address);
  }

  get fullName() {
    return this.firstName + (this.lastName ? " " + this.lastName : "");
  }

  get phoneNumber() {
    return this.mobileCountryCode + this.mobileNumber.toString();
  }
}
