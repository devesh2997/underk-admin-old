import React, { Component } from 'react'
import { paiseToRupeeString } from '../../utils'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Spinner
} from 'reactstrap'
import {
  Badge,
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane
} from 'reactstrap'
import classnames from 'classnames'

import { OrderProductsInfo } from './order-products'

import { beautifyAddress, timeStampToLocaleString } from '../../utils'
import { StatusBadge } from '../../widgets'
import { initDelivery } from '../../services/order.service'
import { to } from '../../services/util.service'

class OrderItem extends Component {
  constructor (props) {
    super(props)
    this.state = {
      modal: false,
      creatingManifest: false,
      manifestingError: null,
      skus: {}
    }
  }
  toggleModal = () => {
    if (this.props.order.status === 'placed') {
      this.setState({ modal: !this.state.modal })
    }
  }

  onChange = skus => {
    this.setState({ skus })
  }
  createManifest = async () => {
    this.setState({ creatingManifest: true, manifestingError: null })
    let skus = []
    let skusArray = Object.keys(this.state.skus)
    for (let i = 0; i < skusArray.length; i++) {
      if (this.state.skus[skusArray[i]] === true) {
        skus.push(skusArray[i])
      }
    }
    if (skus.length < 1) {
      console.log('no product selected')
      this.setState({
        creatingManifest: false,
        manifestingError: 'No product selected.'
      })
      return
    }
    let err, _r
    ;[err, _r] = await to(initDelivery(this.props.order.oid, skus, 'ahmedabad'))
    this.setState({ creatingManifest: false, manifestingError: err })
    if (!err) {
      this.toggleModal()
    }
  }
  render () {
    let { order, idx } = this.props
    let products = JSON.parse(JSON.stringify(order.products))
    return (
      <tr key={order.oid} onClick={this.toggleModal}>
        <Modal
          className='modal-dialog modal-lg'
          isOpen={this.state.modal}
          toggle={this.toggleModal}
        >
          <ModalHeader toggle={this.toggleModal}>Products</ModalHeader>
          <ModalBody>
            <OrderProductsInfo products={products} onChange={this.onChange} />
            {this.state.manifestingError !== null && (
              <div>Error : {this.state.manifestingError}</div>
            )}
          </ModalBody>
          <ModalFooter>
            {this.state.creatingManifest && <Spinner color='info' />}
            {!this.state.creatingManifest && (
              <div>
                <Button color='primary' onClick={this.createManifest}>
                  Create Manifest
                </Button>
                <Button color='secondary' onClick={this.toggleModal}>
                  Cancel
                </Button>
              </div>
            )}
          </ModalFooter>
        </Modal>
        <td>{idx + 1}</td>
        <td>
          oid : {order.oid} <br />
          uid : {order.uid}
        </td>
        <td>
          name : {order.address.name} <br /> mobile : {order.address.mobile}{' '}
          <br /> {beautifyAddress(order.address)}
        </td>
        <td>
          <StatusBadge status={order.status} />
        </td>
        <td>
          mrp : {paiseToRupeeString(order.summary.mrp)} <br /> discount :{' '}
          {paiseToRupeeString(order.summary.discount)} <br /> total :{' '}
          {paiseToRupeeString(order.summary.total)}
        </td>
        <td>
          mode : {order.payment.mode} <br /> status : {order.payment.status}{' '}
          <br />
          {order.payment.method && <span>method : {order.payment.method}</span>}
          {order.payment.bank && (
            <span>
              <br />
              bank : {order.payment.bank}
            </span>
          )}
          {order.payment.vpa && (
            <span>
              <br />
              vpa : {order.payment.vpa}
            </span>
          )}
          {order.payment.wallet && (
            <span>
              <br />
              wallet : {order.payment.wallet}
            </span>
          )}
          {order.payment.created_at && (
            <span>
              <br />
              time : {timeStampToLocaleString(order.payment.created_at * 1000)}
            </span>
          )}
        </td>
        <td>
          <ul>
            {Object.keys(order.products).map(sku => {
              let orderProduct = products[sku].product
              let productQuantity = products[sku].quantity
              return (
                <li key={sku}>
                  <div>
                    {orderProduct.title}
                    <br />
                    {orderProduct.category.name}
                    <br />
                    Qty: {productQuantity}
                    <br />
                    Delivery Status: {products[sku]['delivery']['status']}
                  </div>
                </li>
              )
            })}
          </ul>
        </td>
        <td>{timeStampToLocaleString(order.time)}</td>
      </tr>
    )
  }
}

export { OrderItem }
