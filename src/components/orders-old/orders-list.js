import React, { Component } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Table
} from 'reactstrap'
import {
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from 'reactstrap'
// import { withFirebase } from '../../firebase'
import {OrderItem} from './order-item'

class OrderListBase extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeTab: '1',
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

  toggle = tab => {
    if (this.state.activeTab !== tab) {
      this.unsubscribe()
      this.setState({
        activeTab: tab,
        loading: true
      })
      let status = ''
      switch (tab) {
        case '1':
          status = 'all'
          break
        case '2':
          status = 'placed'
          break
        case '3':
          status = 'created'
          break
        default:
          break
      }
      if (status !== 'all') {
        this.unsubscribe = this.props.firebase
          .ordersByStatus(status)
          .onSnapshot(snapshot => {
            let orders = []

            snapshot.forEach(doc => orders.push({ ...doc.data(), oid: doc.id }))

            this.setState({
              orders,
              loading: false
            })
          })
      } else {
        this.unsubscribe = this.props.firebase.orders().onSnapshot(snapshot => {
          let orders = []

          snapshot.forEach(doc => orders.push({ ...doc.data(), oid: doc.id }))

          this.setState({
            orders,
            loading: false
          })
        })
      }
    }
  }

  tabPane (orders) {
    return (
      <>
        <TabPane tabId='1'>
          <OrdersList orders={orders} />
        </TabPane>
        <TabPane tabId='2'>
          <OrdersList orders={orders} />
        </TabPane>
        <TabPane tabId='3'>
          <OrdersList orders={orders} />
        </TabPane>
      </>
    )
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
          <Nav tabs>
            <NavItem>
              <NavLink
                active={this.state.activeTab[0] === '1'}
                onClick={() => {
                  this.toggle('1')
                }}
              >
                All
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={this.state.activeTab[0] === '2'}
                onClick={() => {
                  this.toggle('2')
                }}
              >
                Placed
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={this.state.activeTab[0] === '3'}
                onClick={() => {
                  this.toggle('3')
                }}
              >
                Created
              </NavLink>
            </NavItem>
          </Nav>
          {!loading && (
            <TabContent activeTab={this.state.activeTab[0]}>
              {this.tabPane(orders)}
            </TabContent>
          )}
        </CardBody>
      </Card>
    )
  }
}

const OrdersList = ({ orders }) => {
  return (
    <Table striped responsive>
      <thead>
        <tr>
          <th>#</th>
          <th>Details</th>
          <th>Location</th>
          <th>Status</th>
          <th>Bill</th>
          <th>Payment</th>
          <th>Products</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order, idx) => (
          <OrderItem order={order} idx={idx} key={idx} />
        ))}
      </tbody>
    </Table>
  )
}




// export default withFirebase(OrderListBase)
