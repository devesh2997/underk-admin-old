// TODO add logic for checking if slug entered is unique or not.
import React, { Component } from 'react'
import { Card, CardBody, CardHeader, FormGroup } from 'reactstrap'
import BasicInfoForm from './forms/basic-info'
import ClothingForm from './forms/clothing'
import { withFirebase } from '../../firebase'
import AssetsUploader from './add-assets'

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
    discount: '0',
    taxPercent: 5,
    isInclusiveTax: true,
    isActive: true,
    type: '',
    assets: {}
  },
  categories: [],
  suppliers: [],
  collectionsAll: [],
  selectedCollections: [],
  loadingCategories: false,
  loadingSuppliers: false,
  loadingCollections: false
}

const AssetView = props => {
  const { name, contentType, size, downloadURL, fullPath } = props.asset
  return (
    <Card key={name + size}>
      <CardBody>
        <div>Name : {name}</div>
        <span>Size : {Math.round(size / 1024)} KB </span>&nbsp;
        <span>Type : {contentType}</span>&nbsp;
        <div>FullPath : {fullPath}</div>
        <div>Download URL : {downloadURL}</div>
      </CardBody>
    </Card>
  )
}

class AddProductBase extends Component {
  constructor (props) {
    super(props)

    this.state = { ...INITIAL_STATE }
  }

  componentDidMount () {
    this.setState({
      loadingCategories: true,
      loadingSuppliers: true,
      loadingCollections: true
    })

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

  addProduct = (product, firebase) => {
    var collections = []
    this.state.selectedCollections.forEach(collection =>
      collections.push(collection.id)
    )
    product.collections = collections
    return firebase.products().add(product)
  }

  onChange = event => {
    let { product } = this.state
    product[event.target.name] = event.target.value
    this.setState({ product })
  }

  onChangeCollections = selectedCollections => {
    let { product } = this.state
    product.collections = selectedCollections
    this.setState({ product, selectedCollections })
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
            handleSubmit={this.addProduct}
          />
        )
      default:
        return null
    }
  }

  getUploadedAssets = () => {
    let assets = this.state.product.assets
    let views = Object.keys(assets).map(asset => (
      <AssetView key={assets[asset].name + asset.size} asset={assets[asset]} />
    ))
    if (Object.keys(this.state.product.assets).length > 0) {
      views = [<h4 key='header'>Uploaded Assets</h4>, ...views]
    }
    return views
  }

  onComplete = assets => {
    let { product } = this.state
    product['assets'] = assets
    this.setState({ product })
  }

  render () {
    const {
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
      Object.keys(product.assets).length === 0 ||
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
          <h4>Add product</h4>
        </CardHeader>
        <CardBody>
          {loadingCategories || loadingSuppliers || loadingCollections ? (
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
              <FormGroup>
                {this.getUploadedAssets()}
                <AssetsUploader
                  product_slug={product.slug}
                  onComplete={this.onComplete}
                />
              </FormGroup>
              {this.getForm(isInvalid)}
            </div>
          )}
        </CardBody>
      </Card>
    )
  }
}

export default withFirebase(AddProductBase)
