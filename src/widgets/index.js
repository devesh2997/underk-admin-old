import React, { Component } from 'react'
import types from 'underk-types'

const StatusBadge = ({ status }) => {
	switch (status) {
		case types.ORDER_STATUS_PLACED:
		case types.PRODUCT_STATUS_CLOSED:
		case types.PRODUCT_STATUS_FULFILLED:
		case types.DELIVERY_STATUS_DELIVERED:
		case types.DELIVERY_STATUS_RETURNED:
		case 'success':
			return <span className='badge badge-success'>{status}</span>
		case 'error':
		case types.PRODUCT_STATUS_USER_CANCELLED:
		case types.PRODUCT_STATUS_CANCELLED:
			return <span className='badge badge-danger'>{status}</span>
		case types.ORDER_STATUS_CREATED:
		case 'init':
			return <span className='badge badge-warning'>{status}</span>
		case types.PRODUCT_STATUS_IN_PROGRESS:
		case types.PRODUCT_STATUS_RETURN_IN_PROGRESS:
		case types.DELIVERY_STATUS_MANIFESTED:
		case types.DELIVERY_STATUS_OUT_FOR_DELIVERY:
		case types.DELIVERY_STATUS_RETURN_MANIFESTED:
		case types.DELIVERY_STATUS_RETURN_REQUESTED:
		case types.DELIVERY_STATUS_MANIFESTED:
		default:
			return <span className='badge badge-primary'>{status}</span>
	}
}

export { StatusBadge }
