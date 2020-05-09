import React, { Component } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Input,
  Label
} from 'reactstrap'
// import { withFirebase } from '../../../firebase'
import { compose } from 'recompose'
import { withRouter } from 'react-router-dom'
import ROUTES from '../../../routes'

const collectionTypes = ['clothing']

class AddCollectionBase extends Component {
  constructor (props) {
    super(props)
    this.state = {
        collectionType:'clothing',
      collection: {}
    }
  }

  handleInputChange = event => {
    let { collection } = this.state
    collection[event.target.name] = event.target.value
    this.setState({ collection })
  }

  getCollectionForm = () => {
    const { collection } = this.state
    return (
      <div>
        <FormGroup>
          <Label>Name</Label>
          <Input
            type='text'
            name='name'
            value={collection.name ? collection.name : ''}
            onChange={this.handleInputChange}
            placeholder='Enter name'
          />
        </FormGroup>
        <FormGroup>
          <Label>Slug</Label>
          <Input
            type='text'
            name='slug'
            value={collection.slug ? collection.slug : ''}
            onChange={this.handleInputChange}
            placeholder='Enter slug'
          />
        </FormGroup>
        <FormGroup>
          <Label>Type</Label>
          <Input
            type='select'
            name='collectionType'
            onChange={e =>
              this.setState({ collectionType: e.target.value })
            }
          >
            <option>Select collection type</option>
            {collectionTypes.map((collectionType, idx) => (
              <option key={idx} value={collectionType}>
                {collectionType}
              </option>
            ))}
          </Input>
        </FormGroup>
      </div>
    )
  }

  handleSubmit = event => {
    event.preventDefault()

    const { collectionType, collection } = this.state
    collection.type = collectionType;

    this.props.firebase.db
      .collection('collections')
      .add(collection)
      .then(() => {
        this.props.history.push(ROUTES.COLLECTION_LIST.path)
      })
      .catch(error => {
        // Handle Error
        console.log(error)
      })
  }

  render () {
    const { collectionType, collection } = this.state
    const isInvalid = !collectionType || !collection.name || !collection.slug

    return (
      <Card>
        <CardHeader>
          <h4>Add Collection</h4>
        </CardHeader>
        <CardBody>
          <Form onSubmit={this.handleSubmit}>
            {this.getCollectionForm()}
            <FormGroup>
              <Button type='submit' color='primary' disabled={isInvalid}>
                Submit
              </Button>
            </FormGroup>
          </Form>
        </CardBody>
      </Card>
    )
  }
}

export default compose(
  // withFirebase,
  withRouter
)(AddCollectionBase)
