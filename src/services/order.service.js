import axios from 'axios'

const URL_INIT_DELIVERY =
	'https://us-central1-underk-firebase.cloudfunctions.net/adminApp/initDelivery'

const URL_CANCEL_PRODUCT =
	'https://us-central1-underk-firebase.cloudfunctions.net/adminApp/cancelProduct'

const initDelivery = async (order_id, skus, warehouse) => {
	let body = { order_id, skus, warehouse }
	try {
		let res = await axios.post(URL_INIT_DELIVERY, body)
		return res
	} catch (err) {
		throw err
	}
}

const cancelProduct = async (orderId, productSKU) => {
	let body = { orderId, productSKU }
	try {
		let res = await axios.post(URL_CANCEL_PRODUCT, body)
		return res
	} catch (err) {
		throw err
	}
}

export { initDelivery, cancelProduct }
