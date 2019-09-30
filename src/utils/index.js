const beautifyAddress = (address)=> {
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

const timeStampToLocaleString = (timestamp) => {
    return new Date(timestamp).toLocaleString()
}

export { beautifyAddress, timeStampToLocaleString}
