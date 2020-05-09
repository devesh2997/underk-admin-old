import React, { Component } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Row
} from 'reactstrap'
// import { withFirebase } from '../../firebase'
import ProductCard from './product-card'

class ProductListBase extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      products: []
    }
  }

  componentDidMount () {
    this.setState({ loading: true })

    this.unsubscribe = this.props.firebase.products().onSnapshot(snapshot => {
      let products = []

      snapshot.forEach(doc => products.push({ ...doc.data(), pid: doc.id }))

      this.setState({
        products,
        loading: false
      })
    })
  }

  componentWillUnmount () {
    this.unsubscribe()
  }

  render () {
    const {
      loading,
      products
    } = this.state

    return (
      <Card>
        <CardHeader>
          <h4>Products</h4>
        </CardHeader>
        <CardBody>
          {loading && (
            <div className='animated fadeIn pt-3 text-center'>Loading...</div>
		  )}
		  <Row>
			{products.map(product => (
				<ProductCard key={product.pid} product={product} />
			))}
		  </Row>
        </CardBody>
      </Card>
    )
  }
}

// export default withFirebase(ProductListBase)
