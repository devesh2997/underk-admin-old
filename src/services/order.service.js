import axios from 'axios'
import { URLS } from '../constants'

const initDelivery = async (order_id, orderFulfilments, warehouse) => {
	let body = { order_id, orderFulfilments, warehouse }
	try {
		let res = await axios.post(URLS.INIT_DELIVERY_URL, body)
		return res
	} catch (err) {
		throw err
	}
}

const cancelProduct = async (orderId, productSKU) => {
	let body = { orderId, productSKU }
	try {
		let res = await axios.post(URLS.CANCEL_PRODUCT_URL, body)
		return res
	} catch (err) {
		throw err
	}
}

export { initDelivery, cancelProduct }
