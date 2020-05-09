import React, { Component } from 'react'
import { Button, Card, CardBody, CardHeader, Table } from 'reactstrap'
// import { withFirebase } from '../../../firebase'

const DeleteCollection = ({ collectionPath, firebase }) => (
  <Button
    type='button'
    color='danger'
    onClick={() => {
      let isConfirmed = window.confirm(
        'Are you sure you want to delete this collection?'
      )
      if (isConfirmed) {
        firebase.db.doc(collectionPath).delete()
      }
    }}
  >
    <i className='fa fa-trash' />
  </Button>
)

class CollectionListBase extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      collections: []
    }

    this.subscriptionList = []
  }

  componentDidMount () {
    this.setState({ loading: true })

    let { collections } = this.state

    this.props.firebase.db.collection('collections').onSnapshot(snapshot => {
      let collectionItems = []

      snapshot.forEach(doc => {
        collectionItems.push({ ...doc.data(), id: doc.id })
      })
      collections = collectionItems

      this.setState({
        loading: false,
        collections
      })
    })
  }

  componentWillUnmount () {
    // this.subscriptionList.unsubscribe();
  }

  render () {
    const { loading, collections } = this.state

    return (
      <Card>
        <CardHeader>
          <h4>Collections</h4>
        </CardHeader>
        <CardBody>
          {loading && (
            <div className='animated fadeIn pt-3 text-center'>Loading...</div>
          )}
          <Table striped responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Slug</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {console.log(collections)}
              {collections.map(collection => (
                <tr>
                  <td>{collection.name}</td>
                  <td>{collection.type}</td>
                  <td>{collection.slug}</td>
                  <td>
                    <DeleteCollection
                      collectionPath={
                        'collections/' + collection.id
                      }
                      firebase={this.props.firebase}
                    />
                  </td>
                </tr>
              ))}
              {/* {Object.keys(collections).map(collectionFor =>
                                Object.keys(collections[collectionFor]).map(collection =>
                                    <tr>
                                        <td>{collectionFor}</td>
                                        <td
                                            dangerouslySetInnerHTML={{
                                                __html: '<pre>' + JSON.stringify(collection, null, 2) + '</pre>'
                                            }}
                                        />
                                        <td>
                                            <DeleteCollection
                                                collectionPath={'collections/' + collectionFor + '/' + collection.id}
                                                firebase={this.props.firebase}
                                            />
                                        </td>
                                    </tr>

                                )
                            )} */}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    )
  }
}

// export default withFirebase(CollectionListBase)
