import React, { Component } from 'react'
import { withFirebase } from '../../firebase'

import {
	Button,
	Container,
	Card,
	CardBody,
	CardHeader,
	Spinner
} from 'reactstrap'

class ProductsHome extends Component {
	constructor (props) {
		super(props)
		this.state = {
			generatingVariants: false
		}
	}

	generateVariants = async () => {
		this.setState({ generatingVariants: true })
        let snapshots = await this.props.firebase.products().get()
        console.log(snapshots)
        snapshots = snapshots.docs
		for (let i = 0; i < snapshots.length; i++) {
            let snapshot = snapshots[i]
            console.log(snapshot)
			if (snapshot.exists) {
				let product = snapshot.data()
				if (product.type === 'clothing') {
					let subtype = product.attributes.subtype
					console.log('generating for : ', snapshot.id)
					let variants = await this.props.firebase
						.products()
						.where('type', '==', 'clothing')
						.where('gender', '==', product.gender)
						.where('category', '==', product.category)
						.where('attributes.subtype', '==', subtype)
						.where(
							'attributes.design.name',
							'==',
							product.attributes.design.name
						)
						.where(
							'attributes.style.name',
							'==',
							product.attributes.style.name
						)
						.get()
					variants.forEach(async variant => {
						if (variant.exists) {
							console.log('variant found : ', variant.id)
							await this.props.firebase.db
								.doc(
									`products/${snapshot.id}/variants/${variant.id}`
								)
								.set({
									pid: variant.id,
									type: 'color',
									value: variant.data().attributes.color,
									slug: variant.data().slug
								})
							// await this.props.firebase.db
							// 	.doc(
							// 		`products/${variant.id}/variants/${snapshot.id}`
							// 	)
							// 	.set({
							// 		pid: snapshot.id,
							// 		type: 'color',
							// 		value: product.attributes.color,
							// 		slug: product.slug
							// 	})
						}
					})
				}
			}
		}
		this.setState({ generatingVariants: false })
	}

	render () {
		const { generatingVariants } = this.state
		return (
			<Card>
				<CardHeader>Products</CardHeader>
				<CardBody>
					{generatingVariants && (
						<Spinner
							color='primary'
							style={{ width: '1rem', height: '1rem' }}
							type='grow'
						/>
					)}
					{!generatingVariants && (
						<Button color='primary' onClick={this.generateVariants}>
							Generate Variants
						</Button>
					)}
				</CardBody>
			</Card>
		)
	}
}

export default withFirebase(ProductsHome)
