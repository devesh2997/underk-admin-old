const BASE_URL =
	process.env.NODE_ENV === "production"
		? "https://us-central1-underk-firebase.cloudfunctions.net"
		: "https://us-central1-underk-dev.cloudfunctions.net";

const PUBLIC_APP = "/publicApp";
const AUTHUSER_APP = "/authUserApp";
const ADMIN_APP = "/adminApp";

export const EVALUATE_PINCODE_URL = (pincode) =>
	BASE_URL + PUBLIC_APP + "/pincode?pincode=" + pincode;

export const CHECK_PINCODE_URL = (pincode) =>
	BASE_URL + PUBLIC_APP + "/checkPincodeAvailability?pincode=" + pincode;

export const GENERATE_INVOICE_URL =
	BASE_URL + ADMIN_APP + "/generateInvoiceWithExternalData";

export const PACKING_SLIP_URL = BASE_URL + ADMIN_APP + "/packing-slip";

export const MANIFEST_RETURN_URL = BASE_URL + ADMIN_APP + "/manifestReturn";

export const INITIATE_REFUND_URL = BASE_URL + ADMIN_APP + "/initiateRefund";

export const CHECKOUT_URL = BASE_URL + AUTHUSER_APP + "/checkout";

export const INIT_DELIVERY_URL = BASE_URL + ADMIN_APP + "/initDelivery";

export const CANCEL_PRODUCT_URL = BASE_URL + ADMIN_APP + "/cancelProduct";
