import React, { Component } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Input,
  Label,
  Spinner
} from 'reactstrap'
import { withFirebase } from '../../firebase'
import { compose } from 'recompose'
import { withRouter } from 'react-router-dom'
import Switch from 'react-switch'

class StrategiesBase extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      strategies: {}
    }
  }

  componentDidMount () {
    this.setState({ loading: true })

    this.unsubscribe = this.props.firebase.strategies().onSnapshot(snapshot => {
      let strategies = {}
      console.log(snapshot)
      if (snapshot.exists) {
        strategies = snapshot.data()
      }
      console.log('stra', strategies)

      this.setState({
        loading: false,
        strategies
      })
    })
  }

  componentWillUnmount () {
    this.unsubscribe()
  }

  handleSearchEnabledChange = checked => {
    this.props.firebase.strategies().set(
      {
        search: {
          enabled: checked
        }
      },
      { merge: true }
    )
  }

  handleFreeDeliveryIfOnlineChange = checked => {
    this.props.firebase.strategies().set(
      {
        delivery_charge: {
          free_if_online: checked
        }
      },
      { merge: true }
    )
  }

  handleFreeDeliveryIfCODChange = checked => {
    this.props.firebase.strategies().set(
      {
        delivery_charge: {
          free_if_cod: checked
        }
      },
      { merge: true }
    )
  }

  render () {
    let { loading, strategies } = this.state
    console.log(strategies)
    return (
      <Card>
        <CardHeader>Strategies</CardHeader>
        <CardBody>
          {loading && <Spinner color='info' />}
          {!loading && (
            <div>
              Search Enabled :{' '}
              <Switch
                onChange={this.handleSearchEnabledChange}
                checked={strategies.search.enabled}
                height={20}
                width={40}
              />
            </div>
          )}
          {!loading && (
            <div>
              <div>Delivery Charge :{strategies.delivery_charge.charge}</div>
              <div>
                Free If Online :{' '}
                <Switch
                  onChange={this.handleFreeDeliveryIfOnlineChange}
                  checked={strategies.delivery_charge.free_if_online}
                  height={20}
                  width={40}
                />
              </div>
              <div>
                Free If COD :{' '}
                <Switch
                  onChange={this.handleFreeDeliveryIfCODChange}
                  checked={strategies.delivery_charge.free_if_cod}
                  height={20}
                  width={40}
                />
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    )
  }
}

export default compose(
  withFirebase,
  withRouter
)(StrategiesBase)
