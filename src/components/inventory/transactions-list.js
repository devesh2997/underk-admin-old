import React from 'react'
// import { withFirebase } from '../../firebase'
import {
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	Container,
	Label,
	Button,
	InputGroup,
	Input,
	InputGroupAddon,
	InputGroupText,
	Col,
	Row,
	ListGroup,
	ListGroupItem,
	ListGroupItemHeading,
	ListGroupItemText,
	Collapse
} from 'reactstrap'

import {
    timeStampToDateLocaleString,
	timeStampToLocaleString,

	timeStampToTimeLocaleString
} from '../../utils/index'

class TransactionsList extends React.Component {
	constructor (props) {
		super(props)
		this.state = {
			loading: false,
			transactions: []
		}
	}

	componentDidMount () {
		this.setState({ loading: true })
		this.props.firebase
			.inventoryTransactions()
			.orderBy('time', 'desc')
			.onSnapshot(snapshot => {
				let transactions = []
				if (!snapshot.empty) {
					snapshot = snapshot.docs
					snapshot.forEach(s => transactions.push(s.data()))
				}
				console.log('tt', transactions)
				this.setState({ loading: false, transactions })
			})
	}

	render () {
		const { loading, transactions } = this.state
		return (
			<Card>
				<CardHeader>Transactions</CardHeader>
				<CardBody>
					{loading && (
						<i className='fa fa-refresh fa-spin fa-3x fa-fw' />
					)}
					{!loading && (
						<ListGroup>
							{transactions.map((transaction, index) => {
								return (
									<ListGroupItem key={index}>
										<Row
											style={{
												fontWeight: 'bold'
											}}
										>
											<Col sm='3'>
												{index +
													1 +
													'.) ' +
													transaction.type}
											</Col>
											<Col>
												{timeStampToLocaleString(
													transaction.time
												)}
											</Col>
										</Row>
										<Row>
											<Col>
												{'sku : ' + transaction.sku}
											</Col>
                                            <Col>
												{'pid : ' + transaction.pid}
											</Col>
										</Row>
									</ListGroupItem>
								)
							})}
						</ListGroup>
					)}
				</CardBody>
			</Card>
		)
	}
}

// export default withFirebase(TransactionsList)
