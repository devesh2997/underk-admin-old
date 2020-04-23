import { stringify, boolify } from '../../../utils';
import { firebase } from '../../../index';

export default class Employee {
	constructor(employee) {
		this.id = stringify(employee.id);
		this.name = stringify(employee.name);
		this.email = stringify(employee.email);
		this.mobile = stringify(employee.mobile);
		this.address = stringify(employee.address);
		this.isAdmin = boolify(employee.isAdmin);
	}

	validate = () => {
		// FIXME: write stricter validation tests

		if(this.name.trim().length === 0) {
			throw(new Error('Invalid name'));
		}
		if(this.email.trim().length === 0) {
			throw(new Error('Invalid email'));
		}
		if(this.mobile.trim().length === 0) {
			throw(new Error('Invalid mobile'));
		}
		if(this.address.trim().length === 0) {
			throw(new Error('Invalid address'));
		}
	}

	save = async () => {
		try {
			await this.validate();

			const data = {
				name: this.name,
				email: this.email,
				mobile: this.mobile,
				address: this.address,
				isAdmin: this.isAdmin
			};

			if(this.id.length > 0) {
				await firebase.employee(this.id).set(data);
			} else {
				await firebase.employees().add(data);
			}

		} catch(error) {
			throw(error);
		}
	}
}
