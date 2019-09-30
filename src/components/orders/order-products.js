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

class OrderProductsInfo extends Component {
  constructor (props) {
    super(props)
    let s = {}
    for (let sku in props.products) {
      if (props.products.hasOwnProperty(sku)) {
        s[sku] = false
      }
    }
    this.state = s
  }

  handleInputChange = event => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    this.setState({
      [name]: value
    })
  }

  render () {
    let { products } = this.props
    let widgets = []
    let count = 0
    for (let sku in products) {
      if (products.hasOwnProperty(sku)) {
        count++
        const product = products[sku]
        const orderProduct = products[sku]['product']
        const quantity = products[sku]['quantity']
        widgets.push(
          <tr key={sku}>
            <td>{count}</td>
            <td>
              <input
                name={sku}
                type='checkbox'
                checked={this.state.sku}
                onChange={this.handleInputChange}
              />
            </td>
            <td>
              title : {orderProduct['title']} <br /> category :{' '}
              {orderProduct['category']['name']} <br /> slug :{' '}
              {orderProduct['slug']}
            </td>
            <td>{quantity}</td>
            <td>status : {product['delivery']['status']}</td>
            <td>{sku}</td>
          </tr>
        )
      }
    }
    return (
      <Table striped responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Select</th>
            <th>Details</th>
            <th>Quantity</th>
            <th>Delivery</th>
            <th>SKU</th>
          </tr>
        </thead>
        <tbody>{widgets}</tbody>
      </Table>
    )
  }
}

export { OrderProductsInfo }
