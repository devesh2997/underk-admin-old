const paiseToRupeeString = paise => {
	paise = Number(paise)
	if (paise % 100 === 0) {
		return '\u20B9' + Math.round(paise / 100).toString()
	} else {
		return '\u20B9' + (paise / 100).toString()
	}
}

const beautifyAddress = address => {
	let addressString = ''
	addressString +=
		address.building +
		', ' +
		address.locality +
		', \n' +
		address.city +
		', ' +
		address.state +
		' - ' +
		address.pincode.toString()

	return addressString
}

const timeStampToLocaleString = timestamp => {
	return new Date(timestamp).toLocaleString()
}

const timeStampToDateLocaleString = timestamp => {
	return new Date(timestamp).toLocaleDateString()
}

const timeStampToTimeLocaleString = timestamp => {
	return new Date(timestamp).toLocaleTimeString()
}

const getDateTimeStampFromDate = date => {
	date = new Date(date.getFullYear(), date.getMonth(), date.getDate())
	return date.getTime()
}

const isEmpty = o => {
	return o === null || o === undefined || (o !== undefined && o.length === 0)
}

const generateSKU = (product, skuOrdering, suppliers, attributesAll) => {
	console.log(attributesAll)
	let sku = ''
	sku +=
		product.gender + product.type + product.subtype + product.category.sku

	for (let i = 0; i < skuOrdering.length; i++) {
		let attributeName = skuOrdering[i]
		sku += product.attributes[attributeName].sku
	}
	console.log(sku)
	let inventory = {}
	let skus = {}
	let options = product.options
	let productSuppliers = Object.keys(options['inventory'])
	if (options['type'] === 'multiple') {
		let basedOnAttributeName = options['based_on']
		let basedOnAttributeAll = attributesAll[basedOnAttributeName]
		for (let i = 0; i < productSuppliers.length; i++) {
			let productSupplierId = productSuppliers[i]
			let bareSID = productSupplierId.split(':')[0]
			let productSupplier = suppliers.find(s => s.sid === bareSID)
			let productOptions = options['inventory'][productSupplierId]
			let productOptionsKeys = Object.keys(productOptions)
			productOptionsKeys.map((key, index) => {
				let productOption = basedOnAttributeAll[key]
				let optionSku = sku + productOption.sku
				let quantity = Number(productOptions[key]['qty'])
				let order = Number(productOptions[key]['order'])
				let cp = Number(productOptions[key]['cp'])
				if (isEmpty(skus[optionSku])) {
					const inStock = quantity > 0
					const lessThanTen = quantity <= 10 ? quantity : 10
					const name = productOption.name
					skus[optionSku] = {
						order,
						inStock,
						lessThanTen,
						name,
						exists: true
					}
				} else {
					const oldSkuValue = skus[optionSku]
					const inStock = oldSkuValue['inStock'] + quantity > 0
					const lessThanTen =
						oldSkuValue['lessThanTen'] + quantity <= 10
							? quantity
							: 10
					skus[optionSku]['inStock'] = inStock
					skus[optionSku]['lessThanTen'] = lessThanTen
				}
				if (isEmpty(inventory[optionSku])) {
					inventory[optionSku] = {
						name: productOption.name,
						reserved: 0,
						inventory: {}
					}
				}
				if (isEmpty(inventory[optionSku][productSupplierId])) {
					inventory[optionSku]['inventory'][productSupplierId] = {
						cp,
						stock: quantity
					}
				}
			})
			console.log('ooo', skus, inventory)
		}
	} else {
		for (let i = 0; i < productSuppliers.length; i++) {
			let productSupplierId = productSuppliers[i]
			let bareSID = productSupplierId.split(':')[0]
			let productSupplier = suppliers.find(s => s.sid === bareSID)
			let productOption = options['inventory'][productSupplierId]
			let quantity = Number(productOption['qty'])
			let cp = Number(productOption['cp'])
			if (isEmpty(skus[sku])) {
				const inStock = quantity > 0
				const lessThanTen = quantity <= 10 ? quantity : 10
				skus[sku] = {
					inStock,
					lessThanTen,
					exists: true
				}
			}else {
				const oldSkuValue = skus[sku]
				const inStock = oldSkuValue['inStock'] + quantity > 0
				const lessThanTen =
					oldSkuValue['lessThanTen'] + quantity <= 10
						? quantity
						: 10
				skus[sku]['inStock'] = inStock
				skus[sku]['lessThanTen'] = lessThanTen
			}
			if (isEmpty(inventory[sku])) {
				inventory[sku] = {
					reserved: 0,
					inventory: {}
				}
			}
			if (isEmpty(inventory[sku][productSupplierId])) {
				inventory[sku]['inventory'][productSupplierId] = {
					cp,
					stock: quantity
				}
			}
		}
	}
	product.options['skus'] = skus
	delete product.options.inventory
	console.log('hhh', { product, inventory })

	return {
		product,
		inventory
	}
}

export {
	beautifyAddress,
	timeStampToLocaleString,
	generateSKU,
	paiseToRupeeString,
	getDateTimeStampFromDate,
	timeStampToDateLocaleString,
	timeStampToTimeLocaleString,
	isEmpty
}
