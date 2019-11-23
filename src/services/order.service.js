import axios from 'axios'

const URL_INIT_DELIVERY =
  'https://us-central1-underk-firebase.cloudfunctions.net/app/initDelivery'

const initDelivery = async (order_id, skus, warehouse) => {
  let body = { order_id, skus, warehouse }
  try{
    let res = await axios.post(URL_INIT_DELIVERY, body)
    return res
  }catch(err){
    throw err
  }
  
}

export { initDelivery }
