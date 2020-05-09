import React, { Component } from 'react'
// import { withFirebase } from '../../firebase'
import {  isEmpty } from '../../utils'

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
		let typesSnapshots = await this.props.firebase.typesSubtypes().get()
		let types = {}
		typesSnapshots.forEach(doc => (types[doc.id] = { ...doc.data() }))

		this.setState({ types, loadingTypes: false })
		let snapshots = await this.props.firebase.products().get()
		console.log(snapshots)
		snapshots = snapshots.docs
		for (let i = 0; i < snapshots.length; i++) {
			let snapshot = snapshots[i]
			console.log(snapshot)
			if (snapshot.exists) {
				let product = snapshot.data()
				const type = product.type.sku
				const subtype = product.subtype.sku
				const skuOrdering = types[type].subtypes[subtype].skuOrdering
				const variantsBasis =
					types[type].subtypes[subtype].variantsBasis

				console.log('generating for : ', snapshot.id)
				let variants = this.props.firebase
					.products()
					.where('type.sku', '==', type)
					.where('gender', '==', product.gender)
					.where('category.cid', '==', product.category.cid)
					.where('subtype.sku', '==', subtype)

				for (let j = 0; j < skuOrdering.length; j++) {
					console.log(skuOrdering[j])
					if (isEmpty(variantsBasis.find(v => v === skuOrdering[j]))){
						console.log('not empty')
						variants = variants.where(
							'attributes.' + skuOrdering[j],
							'==',
							product.attributes[skuOrdering[j]]
						)
					}

				}
				variants = await variants.get()
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
					}
				})
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

// export default withFirebase(ProductsHome)
