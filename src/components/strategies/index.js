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
      loading: false,
      strategies: {}
    }
  }

  componentDidMount () {
    this.setState({ loading: true })

    this.unsubscribe = this.props.firebase.strategies().onSnapshot(snapshot => {
      let strategies = {}
      if (snapshot.exists) {
        strategies = snapshot.data()
      }

      this.setState({
        loading: false,
        strategies
      })
    })
  }

  componentWillUnmount () {
    this.unsubscribe()
  }

  handleChange = checked => {
    this.props.firebase.strategies().set({ search_enabled: checked }, { merge: true })
  }

  render () {
    let { loading, strategies } = this.state
    return (
      <Card>
        <CardHeader>Strategies</CardHeader>
        <CardBody>
          {loading && <Spinner color='info' />}
          {!loading && (
            <div>
              Search Enabled :{' '}
              <Switch
                onChange={this.handleChange}
                checked={strategies.search_enabled}
                height={20}
                width={40}
              />
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
