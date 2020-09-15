import types from 'underk-types'

export const sendProductsInCartSMS = (mobile, firebase) => {
	const sms = {
		number: mobile,
		message: `Hey, I'm your cart from underK. I miss you :( Your items will be out of stock soon. Hurry Now! https://tx.gl/r/27ZeV/%23AdvdTrack%23 Click Here and grab your collection now!`,
		status: types.ACTION_STATUS_INIT,
		time: new Date().getTime()
	}

	return firebase.db.collection('sms').add(sms)
}
