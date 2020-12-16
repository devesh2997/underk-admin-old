import React, { Component, useState } from 'react'
import * as utils from '../../utils'

import { getShiprocketCourierServiceablity } from '../../services/order.service'

import {
	Button,
	Form,
	FormGroup,
	Label,
	Input,
	FormText,
	Row,
	Col,
	ListGroup,
	ListGroupItem
} from 'reactstrap'

const ShiprocketManifest = ({
	isCOD,
	delivery_postcode,
	pickup_postcode,
	onManifest
}) => {
	const [loading, setLoading] = useState(false)

	const [weight, setWeight] = useState(0)

	const [courierData, setCourierData] = useState()

	const fetchCouriers = async () => {
		setLoading(true)
		const res = await getShiprocketCourierServiceablity(
			isCOD,
			weight,
			pickup_postcode,
			delivery_postcode
		)
		console.log(res)
		setCourierData(res)
		setLoading(false)
	}

	return (
		<div>
			{loading && <i className='fa fa-refresh fa-spin fa-3x fa-fw' />}
			{courierData ? (
				<ListGroup>
					{courierData.available_courier_companies.map(
						(courier, index) => {
							return (
								<ListGroupItem key={courier.courier_company_id}>
									<Row>
										<Col sm='1'>#{index + 1}</Col>
										<Col>{courier.courier_name}</Col>
										<Col>Rs. {courier.rate}</Col>
										<Col>ETD: {courier.etd}</Col>
									</Row>
								</ListGroupItem>
							)
						}
					)}
				</ListGroup>
			) : (
				<div>
					<Row>
						<Col>
							<Row>
								<Col>Weight : </Col>
								<Col>
									<Input
										type='number'
										onChange={event =>
											setWeight(event.target.value)
										}
									></Input>
								</Col>
							</Row>
						</Col>
						<Col>
							{weight > 0 && !loading && (
								<Button
									color='primary'
									onClick={() => fetchCouriers()}
								>
									Get Couriers
								</Button>
							)}
						</Col>
					</Row>
				</div>
			)}
		</div>
	)
}

export default ShiprocketManifest
