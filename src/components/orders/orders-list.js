import React, { Component } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalHeader,
  ModalBody,
  Table
} from 'reactstrap'
import { withFirebase } from '../../firebase'
import ROUTES from '../../routes'
import { Link } from 'react-router-dom'

class OrderListBase extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      orders: []
    }
  }

  componentDidMount () {
    this.setState({ loading: true })

    this.unsubscribe = this.props.firebase.orders().onSnapshot(snapshot => {
      let orders = []

      snapshot.forEach(doc => orders.push({ ...doc.data(), oid: doc.id }))

      this.setState({
        orders,
        loading: false
      })
    })
  }

  componentWillUnmount () {
    this.unsubscribe()
  }

  render () {
    const { loading, orders } = this.state

    return (
      <Card>
        <CardHeader>
          <h4>Orders</h4>
        </CardHeader>
        <CardBody>
          {loading && (
            <div className='animated fadeIn pt-3 text-center'>Loading...</div>
          )}
          <Table striped responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Order ID</th>
                <th>UID</th>
                <th>Cart</th>
                <th>Address</th>
                <th>Delivery Status</th>
                <th>Payment Mode</th>
                <th>Payment Status</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={order.oid}>
                  <td>{idx + 1}</td>
                  <td>
                    {order.oid}
                    {/* <div style={{margin:10}}>
											<Button type="button"
												color="primary"
												onClick={() => {
													this.setState({ selectedProductId: product.pid });
													this.toggleVariantModal();
												}}
											>
												<i className="fa fa-arrows"></i>
											</Button>
											<Link to={{
												pathname: `${ROUTES.PRODUCT_LIST.path}/${product.pid}/edit`,
												state: { product }
											}}>
												<Button type="button" color="secondary">
													<i className="fa fa-pencil"></i>
												</Button>
											</Link>
											<DeleteProduct pid={product.pid} firebase={this.props.firebase} />
										</div> */}
                  </td>
                  <td>{order.uid}</td>
                  <td
                    dangerouslySetInnerHTML={{
                      __html:
                        '<pre>' +
                        JSON.stringify(order.cart, null, 2) +
                        '</pre>'
                    }}
                  />
                  <td
                    dangerouslySetInnerHTML={{
                      __html:
                        '<pre>' +
                        JSON.stringify(order.address, null, 2) +
                        '</pre>'
                    }}
                  />
                  <td>{order.deliveryStatus}</td>
                  <td>{order.paymentMode}</td>
                  <td>{order.paymentStatus}</td>
                  <td>{order.status}</td>
                  <td
                    dangerouslySetInnerHTML={{
                      __html:
                        '<pre>' +
                        JSON.stringify(order.time, null, 2) +
                        '</pre>'
                    }}
                  />
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    )
  }
}

export default withFirebase(OrderListBase)
