import React, { Component } from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import BasicInfoForm from './forms/basic-info'
import ClothingForm from './forms/clothing'
import { withFirebase } from '../../firebase'

const INITIAL_STATE = {
  product: {
    title: '',
    gender: '',
    description: '',
    category: '',
    collections: [],
    slug: '',
    supplier_id: '',
    listPrice: '',
    discount: '',
    saleEndDate: '',
    isActive: true,
    type: ''
  },
  categories: [],
  suppliers: [],
  selectedCollections: [],
  collectionsAll: [],
  loadingProductDetails: false,
  loadingCategories: false,
  loadingSuppliers: false,
  loadingCollections: false
}

class EditProductBase extends Component {
  constructor (props) {
    super(props)

    let mappedState = {}
    if (props.location.state) {
      mappedState = { ...props.location.state }
      mappedState.product.category = mappedState.product.category.cid
      delete mappedState.product.pid
    }

    this.state = {
      ...INITIAL_STATE,
      ...mappedState
    }
  }

  componentDidMount () {
    this.setState({
      loadingCategories: true,
      loadingSuppliers: true,
      loadingCollections: true
    })

    if (!this.props.location.state) {
      this.setState({ loadingProductDetails: true })
      this.props.firebase
        .product(this.props.match.params.pid)
        .get()
        .then(doc => {
          let product = doc.data()
          product.category = product.category.cid

          this.setState({
            product,
            loadingProductDetails: false
          })
        })
    }

    this.getCategories = this.props.firebase
      .categories()
      .onSnapshot(snapshot => {
        let categories = []

        snapshot.forEach(doc => categories.push({ ...doc.data(), cid: doc.id }))

        this.setState({
          categories,
          loadingCategories: false
        })
      })
    this.getCollections = this.props.firebase
      .collections()
      .onSnapshot(snapshot => {
        let collectionsAll = []

        snapshot.forEach(doc =>
          collectionsAll.push({ ...doc.data(), id: doc.id })
        )

        this.setState({
          collectionsAll,
          loadingCollections: false
        })
      })

    this.getSuppliers = this.props.firebase.suppliers().onSnapshot(snapshot => {
      let suppliers = []

      snapshot.forEach(doc => suppliers.push({ ...doc.data(), sid: doc.id }))

      this.setState({
        suppliers,
        loadingSuppliers: false
      })
    })
  }

  componentWillUnmount () {
    this.getCategories()
    this.getCollections()
    this.getSuppliers()
  }

  updateProduct = (product, firebase) => {
    var collections = []
    this.state.selectedCollections.forEach(collection =>
      collections.push(collection.id)
    )
    product.collections = collections
    return firebase.product(this.props.match.params.pid).set(product)
  }

  onChange = event => {
    let { product } = this.state
    product[event.target.name] = event.target.value
    this.setState({ product })
  }

  onChangeCollections = selectedCollections => {
    this.setState({ selectedCollections })
  }

  onCheckboxChange = event => {
    let { product } = this.state
    product[event.target.name] = event.target.checked
    this.setState({ product })
  }

  getForm = isProductInvalid => {
    const { product, categories, suppliers } = this.state

    switch (product.type) {
      case 'clothing':
        return (
          <ClothingForm
            product={product}
            isProductInvalid={isProductInvalid}
            categories={categories}
            suppliers={suppliers}
            handleSubmit={this.updateProduct}
          />
        )
      default:
        return null
    }
  }

  render () {
    const {
      loadingProductDetails,
      loadingCategories,
      loadingSuppliers,
      loadingCollections
    } = this.state
    const {
      product,
      categories,
      suppliers,
      collectionsAll,
      selectedCollections
    } = this.state

    const isInvalid =
      product.type === '' ||
      product.title === '' ||
      product.category === '' ||
      product.supplier_id === '' ||
      product.slug === '' ||
      product.listPrice === '' ||
      product.sku === '' ||
      product.gender === ''

    return (
      <Card>
        <CardHeader>
          <h4>Edit product ({this.props.match.params.pid})</h4>
        </CardHeader>
        <CardBody>
          {loadingProductDetails ||
          loadingCategories ||
          loadingSuppliers ||
          loadingCollections ? (
            <div className='animated fadeIn pt-3 text-center'>Loading...</div>
            ) : (
              <div>
                <BasicInfoForm
                  product={product}
                  categories={categories}
                  collectionsAll={collectionsAll}
                  selectedCollections={selectedCollections}
                  suppliers={suppliers}
                  onChange={this.onChange}
                  onChangeCollections={this.onChangeCollections}
                  onCheckboxChange={this.onCheckboxChange}
                />
                {this.getForm(isInvalid)}
              </div>
            )}
        </CardBody>
      </Card>
    )
  }
}

export default withFirebase(EditProductBase)
