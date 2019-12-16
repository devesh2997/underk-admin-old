import React, { Component } from 'react'
import { withFirebase } from '../../../firebase'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { Form, FormGroup, Input, Label, Button } from 'reactstrap'
import CSVReader from 'react-csv-reader'
import { generateSKU } from '../../../utils'

import {
  Container,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText,
  Badge,
  Row,
  Col,
  Spinner
} from 'reactstrap'
import { async } from '@firebase/util'

class BulkUpload extends Component {
  constructor (props) {
    super(props)

    this.state = {
      type: 'clothing',
      categories: [],
      suppliers: [],
      collectionsAll: [],
      loadingCategories: false,
      loadingSuppliers: false,
      loadingCollections: false,
      colors: [],
      styles: [],
      designs: [],
      sizes: [],
      loadingColors: false,
      loadingStyles: false,
      loadingDesigns: false,
      loadingSizes: false,
      totalCSVRows: 0,
      totalProductsWithAssets: 0,
      validProducts: [],
      assetFiles: [],
      errors: [],
      numOfCreatedProducts: 0,
      numOfUpdatedProducts: 0,
      numOfAssetsUploaded: 0,
      totalAssets: 0,
      isUploadingAssets: false,
      isUploadingProducts: false,
      successfullyUploadedAllAssets: false
    }
  }

  componentWillUnmount () {
    this.getColors()
    this.getSizes()
    this.getStyles()
    this.getDesigns()
    this.getCategories()
    this.getCollections()
    this.getSuppliers()
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
    this.setState({
      loadingColors: true,
      loadingStyles: true,
      loadingDesigns: true,
      loadingSizes: true
    })

    this.getColors = this.props.firebase
      .clothingAttributes()
      .collection('colors')
      .onSnapshot(snapshot => {
        let colors = []

        snapshot.forEach(doc => colors.push({ ...doc.data(), id: doc.id }))
        this.setState({
          colors,
          loadingColors: false
        })
      })

    this.getStyles = this.props.firebase
      .clothingAttributes()
      .collection('styles')
      .onSnapshot(snapshot => {
        let styles = []

        snapshot.forEach(doc => styles.push({ ...doc.data(), id: doc.id }))

        this.setState({
          styles,
          loadingStyles: false
        })
      })

    this.getDesigns = this.props.firebase
      .clothingAttributes()
      .collection('designs')
      .onSnapshot(snapshot => {
        let designs = []

        snapshot.forEach(doc => designs.push({ ...doc.data(), id: doc.id }))

        this.setState({
          designs,
          loadingDesigns: false
        })
      })

    this.getSizes = this.props.firebase
      .clothingAttributes()
      .collection('sizes')
      .onSnapshot(snapshot => {
        let sizes = []

        snapshot.forEach(doc => sizes.push({ ...doc.data(), id: doc.id }))

        this.setState({
          sizes,
          loadingSizes: false
        })
      })
  }

  uploadTaskPromise = async (product_slug, file, firebase) => {
    return new Promise(function (resolve, reject) {
      let storageRef = firebase.productAssetsRef().child(product_slug)
      let uploadTask = storageRef.child(file.name).put(file)
      uploadTask.on(
        'state_changed',
        snapshot => {},
        error => {
          console.log(error)
          reject()
        },
        () => {
          const metadata = uploadTask.snapshot.metadata
          const { name, contentType, fullPath, size, bucket } = metadata
          uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
            let newAsset = {
              name,
              contentType,
              fullPath,
              size,
              bucket,
              downloadURL
            }
            resolve(newAsset)
          })
        }
      )
    })
  }

  uploadProducts = async event => {
    this.setState({ isUploadingProducts: true })
    let { validProducts } = this.state

    for (let i = 0; i < validProducts.length; i++) {
      let product = validProducts[i].product
      let inventory = validProducts[i].inventory
      let prevProductRef = this.props.firebase
        .products()
        .where('slug', '==', product.slug)
      let productsRef = this.props.firebase.products()
      let newProductRef = productsRef.doc()
      let inventoryRef = this.props.firebase.inventory()
      let prevProduct = await prevProductRef.get()
      if (prevProduct.empty) {
        let batch = this.props.firebase.db.batch()
        batch.set(newProductRef, product)
        batch.set(inventoryRef.doc(newProductRef.id), inventory)
        try {
          await batch.commit()
          console.log('Uploaded product with id' + newProductRef.id)
          this.setState({
            numOfCreatedProducts: this.state.numOfCreatedProducts + 1
          })
        } catch (e) {
          console.error(e)
        }
      } else {
        try {
          let prevProductDoc = prevProduct.docs[0]
          let prevInventory = await this.props.firebase
            .inventoryOfProduct(prevProductDoc.id)
            .get()
          prevInventory = prevInventory.data()
          Object.keys(product.options.skus).forEach((sku, i) => {
            prevInventory[sku].stock += Number(inventory[sku].stock)
            product.options.skus[sku]['inStock'] = prevInventory[sku].stock > 0
            product.options.skus[sku]['lessThanTen'] =
              prevInventory[sku].stock - prevInventory[sku].reserved <= 10
                ? prevInventory[sku].stock - prevInventory[sku].reserved
                : 10
          })

          let batch = this.props.firebase.db.batch()
          batch.set(this.props.firebase.product(prevProductDoc.id), product)
          batch.set(
            this.props.firebase.inventoryOfProduct(prevProductDoc.id),
            prevInventory
          )
          await batch.commit()
          console.log('Updated product with id' + prevProductDoc.id)
          this.setState({
            numOfUpdatedProducts: this.state.numOfUpdatedProducts + 1
          })
        } catch (e) {
          console.error(e)
        }
      }
    }
    this.setState({ isUploadingProducts: false })
  }

  jaiSriRam = async event => {
    let { validProducts, errors, assetFiles } = this.state

    this.setState({ isUploadingAssets: true })
    for (let i = 0; i < validProducts.length; i++) {
      let assets = {}
      let product = validProducts[i].product
      for (let j = 0; j < product.assets.length; j++) {
        let asset = product.assets[j]
        let newAsset = await this.uploadTaskPromise(
          product.slug,
          asset,
          this.props.firebase
        )
        if (newAsset === undefined) {
          errors.push('Error in uploading asset with name : ' + asset.name)
        } else {
          assets[asset.name] = newAsset
          this.setState({
            numOfAssetsUploaded: this.state.numOfAssetsUploaded + 1
          })
        }
      }
      product['assets'] = assets
      validProducts[i].product = product
      console.log(validProducts[i])
    }
    if (this.state.numOfAssetsUploaded === assetFiles.length) {
      this.setState({ successfullyUploadedAllAssets: true })
    }
    this.setState({ validProducts, isUploadingAssets: false })
  }

  onAssetsFolderChanged = event => {
    let assetFiles = event.target.files
    assetFiles = Array.from(assetFiles)
    let { validProducts } = this.state
    let totalProductsWithAssets = 0
    let totalAssets = 0

    for (let i = 0; i < validProducts.length; i++) {
      let product = validProducts[i].product

      const slug = product.slug

      let productAssets = assetFiles.filter(
        asset => asset.name.substring(0, slug.length) === slug
      )
      // console.log(productAssets)
      totalAssets += productAssets.length
      validProducts[i].product['assets'] = productAssets
      totalProductsWithAssets++
      // console.log(productAssets)
    }

    // console.log(validProducts)
    this.setState({
      assetFiles,
      validProducts,
      totalProductsWithAssets,
      totalAssets
    })
  }

  onChangeType = event => {
    this.setState({ type: event.target.value })
    if (event.target.value === 'clothing') {
      this.setState({
        loadingColors: true,
        loadingStyles: true,
        loadingDesigns: true,
        loadingSizes: true
      })

      this.getColors = this.props.firebase
        .clothingAttributes()
        .collection('colors')
        .onSnapshot(snapshot => {
          let colors = []

          snapshot.forEach(doc => colors.push({ ...doc.data(), id: doc.id }))
          this.setState({
            colors,
            loadingColors: false
          })
        })

      this.getStyles = this.props.firebase
        .clothingAttributes()
        .collection('styles')
        .onSnapshot(snapshot => {
          let styles = []

          snapshot.forEach(doc => styles.push({ ...doc.data(), id: doc.id }))

          this.setState({
            styles,
            loadingStyles: false
          })
        })

      this.getDesigns = this.props.firebase
        .clothingAttributes()
        .collection('designs')
        .onSnapshot(snapshot => {
          let designs = []

          snapshot.forEach(doc => designs.push({ ...doc.data(), id: doc.id }))

          this.setState({
            designs,
            loadingDesigns: false
          })
        })

      this.getSizes = this.props.firebase
        .clothingAttributes()
        .collection('sizes')
        .onSnapshot(snapshot => {
          let sizes = []

          snapshot.forEach(doc => sizes.push({ ...doc.data(), id: doc.id }))

          this.setState({
            sizes,
            loadingSizes: false
          })
        })
    }
  }

  handleFileSelection = async csvdata => {
    let totalCSVRows = 0
    let validProducts = []
    let errors = []

    const {
      categories,
      suppliers,
      collectionsAll,
      colors,
      styles,
      designs,
      sizes
    } = this.state

    for (let i in csvdata) {
      if (Number(i) !== csvdata.length) totalCSVRows++
      let row = csvdata[i]
      if (row.length === 18) {
        let product = {}
        try {
          let title = row[0]
          let slug = row[1]
          let isActive = row[2] === 'TRUE'
          let gender = row[3]
          let category = row[4]
          let collections = JSON.parse(row[5])
          let supplier_id = row[6]
          let listPrice = Number(row[7])
          let discount = row[8]
          let taxPercent = Number(row[9])
          let isInclusiveTax = row[10] === 'TRUE'
          let type = row[11]
          let subtype = row[12]
          let color = row[13]
          let style = row[14]
          let design = row[15]
          let options = JSON.parse(row[16])
          let description = JSON.parse(row[17])

          if (
            title &&
            description &&
            slug &&
            isActive !== undefined &&
            gender &&
            category &&
            supplier_id &&
            listPrice !== undefined &&
            discount &&
            taxPercent !== undefined &&
            isInclusiveTax !== undefined &&
            type === 'clothing' &&
            subtype &&
            color &&
            style &&
            design
          ) {
            if (isNaN(listPrice)) {
              throw 'Invalid list price given at row '
            }
            if (isNaN(taxPercent)) {
              throw 'Invalid tax Percent given at row '
            }
            if (isNaN(discount)) {
              if (discount[discount.length - 1] !== '%') {
                throw 'Invalid discount value'
              }
              const d = discount.substring(0, discount.length)
              if (isNaN(d)) {
                throw 'Invalid discount value'
              }
            }
            if (!isNaN(discount)) {
              if (discount > listPrice) {
                throw 'Discount is greater than listPrice'
              }
            }
            if (gender !== 'M' && gender !== 'F' && gender !== 'U') {
              throw 'Invalid gender at row '
            }

            category = categories.find(c => c.cid === category)
            if (!category) {
              throw 'Invalid category id provided'
            }
            for (let i = 0; i < collections.length; i++) {
              const _col = collectionsAll.find(c => c.slug === collections[i])
              if (!_col) throw 'Invalid collection provided'
            }
            let supplier = suppliers.find(s => s.sid === supplier_id)
            if (!supplier) {
              throw 'Invalid supplier id provided'
            }
            if (subtype !== 'TP' && subtype !== 'BT' && subtype !== 'AC') {
              throw 'Invalid subtype provided'
            }
            supplier_id = supplier.sid
            let supplier_sku = supplier.sku

            color = colors.find(c => c.sku === color)
            if (!color) {
              throw 'Invalid color sku provided'
            }
            style = styles.find(s => s.sku === style)
            if (!style) {
              throw 'Invalid style sku provided'
            }
            design = designs.find(d => d.sku === design)
            if (!design) {
              throw 'Invalid design sku provided'
            }

            let sizeValues = {}
            Object.keys(options).forEach(sizeName => {
              let size = sizes.find(s => s.name === sizeName)
              if (!size) {
                throw 'Invalid size name'
              }
              let quantity = options[sizeName]['qty']
              let order = options[sizeName]['order']
              if (isNaN(quantity)) {
                throw 'Invalid quantity given for size ' + sizeName
              }
              if (isNaN(order)) {
                throw 'Invalid order given for size ' + sizeName
              }
              sizeValues[sizeName] = { quantity, order }
            })

            let attributes = { subtype, color, style, design }
            options = {
              type: 'multiple',
              based_on: 'size',
              values: sizeValues
            }
            product = {
              title,
              description,
              slug,
              isActive,
              gender,
              category,
              supplier_id,
              supplier_sku,
              listPrice,
              discount,
              taxPercent,
              isInclusiveTax,
              type,
              collections,
              options,
              attributes
            }

            let pr = validProducts.find(p => p.slug == product.slug)
            if (pr !== undefined) {
              throw 'Slug matches with another product in the sheet. Other product title : ' +
                pr.title
            }

            let productAndInventoryObject = {}
            productAndInventoryObject = generateSKU(product, sizes)
            if (
              productAndInventoryObject.product === null ||
              productAndInventoryObject.product === undefined
            ) {
              throw 'Product object not returned when generating SKU.'
            }
            if (
              productAndInventoryObject.inventory === null ||
              productAndInventoryObject.inventory === undefined
            ) {
              throw 'Inventory object not returned when generating SKU.'
            }
            let product = productAndInventoryObject.product

            Object.keys(product.options.skus).forEach(sku => {
              for (let i = 0; i < validProducts.length; i++) {
                Object.keys(validProducts[i].product.options.skus).forEach(
                  s => {
                    if (s === sku) {
                      throw 'SKU matches with another product in the sheet, Other product title : ' +
                        validProducts[i].product.title
                    }
                  }
                )
              }
            })
            // console.log(productAndInventoryObject)
            validProducts.push(productAndInventoryObject)
          } else {
            throw 'All the fields are not filled or invalid type is given at row '
          }
        } catch (error) {
          let errorrow = Number(i) + 1
          errors.push('Row : ' + errorrow + ', Error : ' + error)
          console.log('Row : ', errorrow, ', Error : ', error)
        }
      } else {
        if (Number(i) !== csvdata.length - 1) {
          let errorrow = Number(i) + 1
          console.log('Invalid number of columns at row ' + errorrow)
          errors.push('Row ' + errorrow + ' : Invalid number of columns.')
        }
      }
    }
    console.log('total rows : ', totalCSVRows)
    console.log('valid products : ', validProducts.length)
    this.setState({ totalCSVRows, validProducts, errors })
  }

  getForm = () => {
    const { type } = this.state
    let loading = false
    if (type === 'clothing') {
      const {
        loadingColors,
        loadingDesigns,
        loadingStyles,
        loadingSizes
      } = this.state
      loading = loadingColors || loadingDesigns || loadingSizes || loadingStyles
    }

    const {
      validProducts,
      totalCSVRows,
      errors,
      totalProductsWithAssets,
      isUploadingAssets,
      numOfAssetsUploaded,
      assetFiles,
      successfullyUploadedAllAssets,
      isUploadingProducts,
      numOfCreatedProducts,
      numOfUpdatedProducts
    } = this.state

    let errorTexts = []
    for (let i = 0; i < errors.length; i++) {
      errorTexts.push(<div key={i}>{errors[i]}</div>)
    }

    return (
      <Form>
        <FormGroup>
          <Label>Type</Label>
          <Input
            type='select'
            name='type'
            value={this.state.type}
            onChange={this.onChangeType}
          >
            <option value=''>Select type</option>
            <option value='clothing'>Clothing</option>
          </Input>
        </FormGroup>
        {type !== '' ? (
          loading ? (
            <div className='animated fadeIn pt-3 text-center'>Loading...</div>
          ) : (
            <div>
              <FormGroup>
                <Label>Choose CSV file</Label>
                <CSVReader
                  cssClass='csv-reader-input'
                  label=''
                  onFileLoaded={this.handleFileSelection}
                  onError={this.handleFileSelectionError}
                  inputId='ObiWan'
                  inputStyle={{}}
                />
              </FormGroup>
              {totalCSVRows > 0 ? (
                <div>
                  {errorTexts}
                  {/* totalCSVRows === validProducts.length */}
                  {true ? (
                    <div style={{ marginTop: 20 }}>
                      <FormGroup>
                        <Label>Choose Assets Folder</Label>
                        <Input
                          label='Choose Assets Folder'
                          directory=''
                          webkitdirectory=''
                          type='file'
                          onChange={this.onAssetsFolderChanged}
                        />
                      </FormGroup>
                      {totalProductsWithAssets === validProducts.length ? (
                        <div>
                          <Label>
                            Total assets uploaded : {numOfAssetsUploaded} of{' '}
                            {assetFiles.length}
                          </Label>
                          {!successfullyUploadedAllAssets ? (
                            !isUploadingAssets ? (
                              <div>
                                {/* <Button
                                  onClick={this.jaiSriRam}
                                  color={'primary'}
                                >
                                  Upload Assets #JaiSriRam
                                </Button> */}
                              </div>
                            ) : (
                              <div>Uploading Assets ...</div>
                            )
                          ) : (
                            <div>
                              <Label>
                                Total Products Created : {numOfCreatedProducts}
                              </Label>
                              <br />
                              <Label>
                                Total Products Updated : {numOfUpdatedProducts}
                              </Label>
                              <br />
                              {!isUploadingProducts ? (
                                <Button
                                  onClick={this.uploadProducts}
                                  color={'primary'}
                                >
                                  Upload Product Data
                                  #Good_Job_creating_csv_file_and_assets_folder
                                </Button>
                              ) : (
                                <div>Uploading Products ...</div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div />
                      )}
                    </div>
                  ) : (
                    <div />
                  )}
                </div>
              ) : (
                <div />
              )}
            </div>
          )
        ) : (
          <div />
        )}
      </Form>
    )
  }

  uploadNewProducts = async () => {
    let { validProducts, errors } = this.state
    this.setState({ uploading: true })
    for (let i = 0; i < validProducts.length; i++) {
      if (validProducts[i]['indb']) continue
      validProducts[i]['queued'] = true
      this.setState({ validProducts })
    }
    for (let i = 0; i < validProducts.length; i++) {
      if (validProducts[i]['indb']) continue
      let assets = {}
      validProducts[i]['uploading'] = true
      this.setState({ validProducts })
      let product = validProducts[i].product
      let synced = validProducts[i].synced
      let syncing = validProducts[i].syncing
      if (!syncing && synced) {
        for (let j = 0; j < product.assets.length; j++) {
          let asset = product.assets[j]
          let newAsset = await this.uploadTaskPromise(
            product.slug,
            asset,
            this.props.firebase
          )
          if (newAsset === undefined) {
            errors.push('Error in uploading asset with name : ' + asset.name)
          } else {
            assets[asset.name] = newAsset
            this.setState({
              numOfAssetsUploaded: this.state.numOfAssetsUploaded + 1
            })
          }
        }
        product['assets'] = assets
        let inventory = validProducts[i].inventory
        let prevProductRef = this.props.firebase
          .products()
          .where('slug', '==', product.slug)
        let productsRef = this.props.firebase.products()
        let newProductRef = productsRef.doc()
        let inventoryRef = this.props.firebase.inventory()
        let prevProduct = await prevProductRef.get()
        if (prevProduct.empty) {
          let batch = this.props.firebase.db.batch()
          batch.set(newProductRef, product)
          batch.set(inventoryRef.doc(newProductRef.id), inventory)
          try {
            await batch.commit()
            console.log('Uploaded product with id' + newProductRef.id)
            validProducts[i]['queued'] = false
            validProducts[i]['uploading'] = false
            this.setState({
              numOfCreatedProducts: this.state.numOfCreatedProducts + 1,
              validProducts
            })
          } catch (e) {
            validProducts[i]['error'] = e
            this.setState({ validProducts })
            console.error(e)
          }
        }
        // validProducts[i].product = product
        // console.log(validProducts[i])
      }
    }
    this.setState({ uploading: false })
  }

  sync = async () => {
    let { validProducts } = this.state
    this.setState({ synced: true, syncing: true })
    let numOfNewProducts = 0
    let numOfPrevProducts = 0
    const results = validProducts.map(async (product, index) => {
      validProducts[index]['syncing'] = true
      this.setState({ validProducts })
      const p = product.product
      const i = product.inventory
      let prevProductRef = this.props.firebase
        .products()
        .where('slug', '==', p.slug)
      prevProductRef.onSnapshot(snapshot => {
        validProducts[index]['synced'] = true
        validProducts[index]['syncing'] = false
        if (!snapshot.empty) {
          validProducts[index]['indb'] = snapshot.docs[0]
          numOfPrevProducts++
        } else {
          numOfNewProducts++
        }
        this.setState({
          validProducts,
          numOfPrevProducts,
          numOfNewProducts
        })
        if (validProducts.length === numOfNewProducts + numOfPrevProducts) {
          this.setState({ syncing: false })
        }
      })
    })
  }

  getSummary = () => {
    const {
      synced,
      syncing,
      uploading,
      validProducts,
      totalCSVRows,
      errors,
      totalProductsWithAssets,
      totalAssets,
      isUploadingAssets,
      numOfAssetsUploaded,
      assetFiles,
      successfullyUploadedAllAssets,
      isUploadingProducts,
      numOfCreatedProducts,
      numOfUpdatedProducts,
      numOfPrevProducts,
      numOfNewProducts
    } = this.state
    if (totalCSVRows === 0) return <div />
    let categories = {}
    validProducts.map((product, index) => {
      const p = product.product
      const i = product.inventory
      const syncing = product.syncing
      const synced = product.synced
      const indb = product.indb
      const uploading = product.uploading
      const queued = product.queued
      // console.log(p)
      // console.log(i)
      if (!categories[p.category.slug]) {
        categories[p.category.slug] = []
      }
      categories[p.category.slug].push(
        <ListGroupItem key={index}>
          <ListGroupItemHeading>
            {index + 1 + '.  ' + p.title + '  '}
            {syncing && (
              <Spinner
                color='primary'
                style={{ width: '1rem', height: '1rem' }}
                type='grow'
              />
            )}
            {uploading && (
              <span>
                <Spinner
                  color='success'
                  style={{ width: '1rem', height: '1rem' }}
                  type='grow'
                />
                {'   uploading...'}
              </span>
            )}
            {queued && !uploading && (
              <span>
                <Spinner
                  color='warning'
                  style={{ width: '1rem', height: '1rem' }}
                  type='grow'
                />
                {'   queued...'}
              </span>
            )}
          </ListGroupItemHeading>
          <Container>
            {p.attributes.color && (
              <Row>
                <Col style={{ color: p.attributes.color.hexcode }}>
                  {p.attributes.color.name}
                </Col>
                <Col>
                  Inventory -{' '}
                  {Object.keys(i).map((sku, index) => {
                    return (
                      <span key={index}>
                        {i[sku]['name'] +
                          ' : ' +
                          i[sku]['stock'] +
                          ' | ' +
                          i[sku]['reserved'] +
                          ',  '}
                      </span>
                    )
                  })}
                </Col>
              </Row>
            )}
            {p.assets && (
              <Row>
                <Col>
                  <Label>Assets </Label>
                  <Badge pill>{p.assets.length}</Badge>
                </Col>
                <Col />
              </Row>
            )}
            {synced && (
              <Row>
                {indb && <Col>Indb</Col>}
                {!indb && (
                  <Col>
                    <Badge color='success'>New</Badge>
                  </Col>
                )}
              </Row>
            )}
          </Container>
        </ListGroupItem>
      )
    })
    return (
      <Container>
        <Row>
          <Col>Total Number of Rows in CSV : </Col>
          <Col>{totalCSVRows}</Col>
        </Row>
        <Row>
          <Col>Total Valid Products : </Col>
          <Col>{validProducts.length}</Col>
        </Row>
        <Row>
          <Col>Total Products for which assets were found : </Col>
          <Col>{totalProductsWithAssets}</Col>
        </Row>
        <Row>
          <Col>Total Assets : </Col>
          <Col>{totalAssets}</Col>
        </Row>
        {synced && (
          <div>
            <Row>
              <Col>Number of New Products : </Col>
              <Col>{numOfNewProducts}</Col>
            </Row>
            <Row>
              <Col>Number of Old Products : </Col>
              <Col>{numOfPrevProducts}</Col>
            </Row>
            <Row>
              <Col>Number of Created Products : </Col>
              <Col>{numOfCreatedProducts}</Col>
            </Row>
            <Row>
              <Col>Number of Updated Products : </Col>
              <Col>{numOfUpdatedProducts}</Col>
            </Row>
          </div>
        )}
        <br />
        <Row>
          <Col>
            <h3>Valid Products:</h3>
          </Col>
          {!uploading && (
            <Row>
              <Col>
                {!syncing ? (
                  <Button outline color='primary' onClick={this.sync}>
                    Sync
                  </Button>
                ) : (
                  <Spinner
                    color='primary'
                    style={{ width: '2rem', height: '2rem' }}
                    type='grow'
                  />
                )}
              </Col>
              {!syncing &&
                synced &&
                totalProductsWithAssets > 0 &&
                numOfNewProducts > 0 && (
                <Col>
                  <Button
                    outline
                    color='primary'
                    onClick={this.uploadNewProducts}
                  >
                      Upload New Products
                  </Button>
                </Col>
              )}
              {!syncing &&
                synced &&
                totalProductsWithAssets > 0 &&
                numOfPrevProducts > 0 && (
                <Col>
                  <Button outline color='primary' onClick={this.sync}>
                      Update Old Products
                  </Button>
                </Col>
              )}
            </Row>
          )}
          {uploading && (
            <Col>
              <Spinner
                color='primary'
                style={{ width: '2rem', height: '2rem' }}
                type='grow'
              />
            </Col>
          )}
        </Row>
        <br />
        <ListGroup>
          {Object.keys(categories).map((slug, index) => {
            return (
              <ListGroup key={slug}>
                <ListGroupItemHeading>
                  {index + 1 + ') ' + slug + '    '}
                  <Badge pill>{categories[slug].length}</Badge>
                </ListGroupItemHeading>
                {categories[slug]}
                <br />
              </ListGroup>
            )
          })}
        </ListGroup>
      </Container>
    )
  }
  render () {
    const {
      loadingCategories,
      loadingSuppliers,
      loadingCollections
    } = this.state
    const { type } = this.state
    return (
      <div>
        <Card>
          <CardHeader>Bulk Upload</CardHeader>
          <CardBody>
            {loadingCategories || loadingSuppliers || loadingCollections ? (
              <div className='animated fadeIn pt-3 text-center'>Loading...</div>
            ) : (
              this.getForm()
            )}
          </CardBody>
        </Card>
        {loadingCategories || loadingSuppliers || loadingCollections ? (
          <div />
        ) : (
          <Card>
            <CardHeader>Summary</CardHeader>
            <CardBody>{this.getSummary()}</CardBody>
          </Card>
        )}
      </div>
    )
  }
}

export default withFirebase(BulkUpload)
