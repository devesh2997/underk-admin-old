import axios from 'axios'
import { isEmpty } from '../utils'

const URL_INIT_DELIVERY =
	'https://us-central1-underk-firebase.cloudfunctions.net/adminApp/initDelivery'

const URL_CANCEL_PRODUCT =
	'https://us-central1-underk-firebase.cloudfunctions.net/adminApp/cancelProduct'

const initDelivery = async (order_id, orderFulfilments, warehouse) => {
	let body = { order_id, orderFulfilments, warehouse }
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

const getShiprocketToken = async () => {
	const url = 'https://apiv2.shiprocket.in/v1/external/auth/login'
	try {
		let res = await axios.post(url, {
			email: 'ananddevesh29@outlook.com',
			password: 'devdas23'
		})
		const data = res.data
		return data.token
	} catch (err) {
		console.error(err)
		return undefined
	}
}

const getShiprocketCourierServiceablity = async (
	isCOD,
	weight,
	pickup_postcode,
	delivery_postcode
) => {
	const token = await getShiprocketToken()
	const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability?cod=${isCOD}&weight=${weight}&pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}`
	try {
		let res = await axios.get(url, {
			headers: {
				Authorization: 'Bearer ' + token
			}
		})
		const data = res.data.data
		return data
	} catch (err) {
		console.error(err)
		return undefined
	}
}

export { initDelivery, cancelProduct, getShiprocketCourierServiceablity }
