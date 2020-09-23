import React, { useState, useEffect } from 'react'
import axios from "axios";

import {
	Button
} from 'reactstrap'

const PackingSlipButton = props => {
	const { trackingId } = props
	const [loading, setLoading] = useState(false)

	const printDeliverySlip = async () => {
		setLoading(true)
		const url =
			'https://us-central1-underk-firebase.cloudfunctions.net/adminApp/packing-slip'
		const data = {
			waybill: trackingId
		}
		const response = await axios.post(url, data)
		setLoading(false)
		// console.log(response.data)
		var newWindow = window.open()
		newWindow.document.write(response.data)
		// newWindow.print()
	}

	return (
		<div>
			{loading && <i className='fa fa-refresh fa-spin fa-fw' />}
			{!loading && (
				<Button
					onClick={() => printDeliverySlip(trackingId)}
					style={{ marginLeft: '40px' }}
					color='primary'
				>
					Print Packing Slip
				</Button>
			)}
			{}
		</div>
	)
}

export default PackingSlipButton
