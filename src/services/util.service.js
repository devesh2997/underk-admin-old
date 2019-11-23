import { to as TO } from 'await-to-js'

const to = async promise => {
  let err, res
  ;[err, res] = await TO(promise)
  if (err) console.log(err)
  return [err, res]
}

const TE = function (err_message, log) {
  // TE stands for Throw Error
  if (log === true) {
    console.error(err_message)
  }

  throw new Error(err_message)
}

export { to, TE }
