import * as utils from '../../utils'

const INVENTORY_TRANSACTION_TYPE = {
	INCREASE: 'INCREASE',
	DECREASE: 'DECREASE',
	SET: 'SET',
	RESERVE: 'RESERVE',
	CREATE: 'CREATE',
	FULFIL: 'FULFIL',
	UNRESERVE: 'UNRESERVE'
}

const getInventoryTransactionRef = firestore => {
	return firestore.collection('inventory_transactions')
}

const getInventoryRef = (firestore, pid) => {
	return firestore.collection('inventory').doc(pid)
}

const getProductRef = (firestore, pid) => {
	return firestore.collection('products').doc(pid)
}

//stockSet is an object {'sku':<sku>,'set':{<supp_id:<num>>:<quantity>,<supp_id:<num>>:<quantity>}}
export const setStock = async (firestore, pid, stockSet, reason) => {
	if (utils.isEmpty(reason)) reason = ''
	let inventoryRef = getInventoryRef(firestore, pid)
	let productRef = getProductRef(firestore, pid)

	let sku = stockSet.sku
	await firestore.runTransaction(async transaction => {
		let inventory = await transaction.get(inventoryRef)
		let product = await transaction.get(productRef)
		product = product.data()
		if (inventory.exists) {
			inventory = inventory.data()
			const inventorySupplierKeys = Object.keys(stockSet.set)
			for (let i = 0; i < inventorySupplierKeys.length; i++) {
				let supplierId = inventorySupplierKeys[i]
				const bareSupplierId = supplierId.split(':')[0]
				const quantity = Number(stockSet.set[supplierId])
				inventory[sku].stock = quantity
				inventory[sku]['inventory'][supplierId].stock = quantity
				if (inventory[sku].stock <= inventory[sku].reserved) {
					product.options.skus[sku].inStock = false
				} else {
					product.options.skus[sku].inStock = true
				}
				if (inventory[sku].stock - inventory[sku].reserved <= 10) {
					if (inventory[sku].stock - inventory[sku].reserved > 0) {
						product.options.skus[sku].lessThanTen =
							inventory[sku].stock - inventory[sku].reserved
					} else {
						product.options.skus[sku].lessThanTen = 0
					}
				} else {
					product.options.skus[sku].lessThanTen = 10
				}
				transaction.set(
					getInventoryTransactionRef(firestore).doc(),
					{
						pid,
						sku,
						bareSupplierId,
						supplierId,
						quantity,
						type: INVENTORY_TRANSACTION_TYPE.SET,
						time: Date.now(),
						reason
					},
					{ merge: true }
				)
				transaction.set(productRef, product, { merge: true })
			}
		}

		transaction.set(inventoryRef, inventory, { merge: true })
	})
}

//stockIncrease is an object {'sku':<sku>,'increase':{<supp_id:<num>>:<quantity>,<supp_id:<num>>:<quantity>}}
export const increaseStock = async (firestore, pid, stockIncrease, reason) => {
	if (utils.isEmpty(reason)) reason = ''
	let inventoryRef = getInventoryRef(firestore, pid)
	let productRef = getProductRef(firestore, pid)

	let sku = stockIncrease.sku
	await firestore.runTransaction(async transaction => {
		let inventory = await transaction.get(inventoryRef)
		let product = await transaction.get(productRef)
		product = product.data()
		if (inventory.exists) {
			inventory = inventory.data()
			const inventorySupplierKeys = Object.keys(stockIncrease.increase)
			for (let i = 0; i < inventorySupplierKeys.length; i++) {
				let supplierId = inventorySupplierKeys[i]
				const bareSupplierId = supplierId.split(':')[0]
				const quantity = Number(stockIncrease.increase[supplierId])
				inventory[sku].stock += quantity
				inventory[sku]['inventory'][supplierId].stock += quantity
				if (inventory[sku].stock === inventory[sku].reserved) {
					product.options.skus[sku].inStock = false
				} else {
					product.options.skus[sku].inStock = true
				}
				if (inventory[sku].stock - inventory[sku].reserved <= 10) {
					if (inventory[sku].stock - inventory[sku].reserved > 0) {
						product.options.skus[sku].lessThanTen =
							inventory[sku].stock - inventory[sku].reserved
					} else {
						product.options.skus[sku].lessThanTen = 0
					}
				} else {
					product.options.skus[sku].lessThanTen = 10
				}
				transaction.set(
					getInventoryTransactionRef(firestore).doc(),
					{
						pid,
						sku,
						bareSupplierId,
						supplierId,
						quantity,
						type: INVENTORY_TRANSACTION_TYPE.INCREASE,
						time: Date.now(),
						reason
					},
					{ merge: true }
				)
				transaction.set(productRef, product, { merge: true })
			}
		}

		transaction.set(inventoryRef, inventory, { merge: true })
	})
}

//stockDecrease is an object {'sku':<sku>,'decrease':{<supp_id:<num>>:<quantity>,<supp_id:<num>>:<quantity>}}
export const decreaseStock = async (firestore, pid, stockDecrease, reason) => {
	if (utils.isEmpty(reason)) reason = ''
	let inventoryRef = getInventoryRef(firestore, pid)
	let productRef = getProductRef(firestore, pid)

	let sku = stockDecrease.sku
	await firestore.runTransaction(async transaction => {
		let inventory = await transaction.get(inventoryRef)
		let product = await transaction.get(productRef)
		product = product.data()
		if (inventory.exists) {
			inventory = inventory.data()
			const inventorySupplierKeys = Object.keys(stockDecrease.decrease)
			for (let i = 0; i < inventorySupplierKeys.length; i++) {
				let supplierId = inventorySupplierKeys[i]
				const bareSupplierId = supplierId.split(':')[0]
				const quantity = Number(stockDecrease.decrease[supplierId])
				inventory[sku].stock -= quantity
				inventory[sku]['inventory'][supplierId].stock -= quantity
				if (inventory[sku].stock <= inventory[sku].reserved) {
					product.options.skus[sku].inStock = false
				} else {
					product.options.skus[sku].inStock = true
				}
				if (inventory[sku].stock - inventory[sku].reserved <= 10) {
					if (inventory[sku].stock - inventory[sku].reserved > 0) {
						product.options.skus[sku].lessThanTen =
							inventory[sku].stock - inventory[sku].reserved
					} else {
						product.options.skus[sku].lessThanTen = 0
					}
				} else {
					product.options.skus[sku].lessThanTen = 10
				}
				transaction.set(
					getInventoryTransactionRef(firestore).doc(),
					{
						pid,
						sku,
						bareSupplierId,
						supplierId,
						quantity,
						type: INVENTORY_TRANSACTION_TYPE.DECREASE,
						time: Date.now(),
						reason
					},
					{ merge: true }
				)
				transaction.set(productRef, product, { merge: true })
			}
		}

		transaction.set(inventoryRef, inventory, { merge: true })
	})
}
