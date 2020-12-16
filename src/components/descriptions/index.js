import React from "react";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Col,
	Collapse,
	Row,
} from "reactstrap";
import { withFirebase } from "../../firebase";
import DescriptionList from "./description-list";
import DescriptionForm from "./descriptions-form";

class Descriptions extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isDescriptionsLoading: false,
			descriptions: [],
			isFormOpen: false,
		};
	}

	componentDidMount() {
		this.getDescriptions();
	}

	componentWillUnmount() {
		this.unsubscribe && this.unsubscribe();
	}

	getDescriptions = () => {
		this.setState({ isDescriptionsLoading: true });
		this.unsubscribe = this.props.firebase
			.descriptions()
			.onSnapshot((snapshot) => {
				let descriptions = [];
				snapshot.forEach((doc) => {
					descriptions.push({ ...doc.data(), id: doc.id });
				});

				this.setState({ isDescriptionsLoading: false, descriptions });
			});
	};

	render() {
		const { isDescriptionsLoading, descriptions, isFormOpen } = this.state;

		return (
			<Card>
				<CardHeader>
					<Row>
						<Col sm={6}>
							<h4>Descriptions</h4>
						</Col>
						<Col sm={6} className="text-right">
							<Button
								type="button"
								color="primary"
								onClick={() =>
									this.setState((prevState) => ({
										isFormOpen: !prevState.isFormOpen,
									}))
								}
							>
								Add Description
							</Button>
						</Col>
					</Row>
				</CardHeader>
				<CardBody>
					<Collapse
						isOpen={isFormOpen}
						style={{
							margin: "-1.25rem -1.25rem 1.25rem",
							padding: "1.25rem",
							backgroundColor: "rgb(228, 229, 230)",
						}}
					>
						<DescriptionForm
							onFinish={() =>
								this.setState({ isFormOpen: false })
							}
						/>
					</Collapse>
					{isDescriptionsLoading ? (
						<div className="animated fadeIn pt-3 text-center">
							Loading...
						</div>
					) : (
						<DescriptionList descriptions={descriptions} />
					)}
				</CardBody>
			</Card>
		);
	}
}

export default withFirebase(Descriptions);
