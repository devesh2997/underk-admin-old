import React, { Component } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table
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

class OrderItem extends Component {
  constructor (props) {
    super(props)
    this.state = {
      modal: false
    }
  }
  toggleModal = () => {
    this.setState({ modal: !this.state.modal })
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
            <OrderProductsInfo products={products} />
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onClick={this.submitWriteRequest}>
              Write
            </Button>{' '}
            <Button color='secondary' onClick={this.toggleModal}>
              Cancel
            </Button>
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
          mrp : {order.mrp} <br /> discount : {order.discount} <br /> total :{' '}
          {order.total}
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
              time : {timeStampToLocaleString(order.payment.created_at*1000)}
            </span>
          )}
        </td>
        <td>{timeStampToLocaleString(order.time)}</td>
      </tr>
    )
  }
}

export { OrderItem }
