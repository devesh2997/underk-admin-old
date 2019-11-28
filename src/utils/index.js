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

const generateSKU = (product, sizeOptions) => {
  let sku = ''
  sku += product.supplier_sku
  delete product.supplier_sku
  sku += product.gender
  sku += 'CLTH' // CLOTHING TYPE SKU
  sku += product.attributes.subtype
  sku += product.category.sku
  sku += product.attributes.style.sku
  // delete product.attributes.style.sku;
  sku += product.attributes.color.sku
  // delete product.attributes.color.sku;
  sku += product.attributes.design.sku
  // delete product.attributes.design.sku;

  let newOptions = {}
  let inventory = {}

  Object.keys(product.options.values).forEach(size => {
    const quantity = Number(product.options.values[size].quantity)
    let sizeSku = sizeOptions.find(s => s.name === size).sku
    sizeSku = sku + sizeSku
	newOptions[sizeSku] = {}
	inventory[sizeSku] = {}
    inventory[sizeSku]['stock'] = quantity
	inventory[sizeSku]['reserved'] = 0
	inventory[sizeSku]['name'] = size
    // newOptions[sizeSku]['quantity'] = Number(product.options.values[size].quantity);
    newOptions[sizeSku]['inStock'] = quantity > 0
    newOptions[sizeSku]['lessThanTen'] = quantity <= 10 ? quantity : 10
    newOptions[sizeSku]['name'] = size
    newOptions[sizeSku]['exists'] = true
    product.options.values[size].sku = sizeSku
  })
  delete product.options.values
  product.options['skus'] = newOptions

  return {
    product,
    inventory
  }
}

export {
  beautifyAddress,
  timeStampToLocaleString,
  generateSKU,
  paiseToRupeeString
}
