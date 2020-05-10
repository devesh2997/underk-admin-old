import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
} from "reactstrap";

import { AuthUserContext, withAuthorization } from "../../../session";

function Login(props) {
  let isMounted = useRef(true);

  const authUser = useContext(AuthUserContext);

  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setPasswordVisibility] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await authUser.login(alias, password);
    } catch (error) {
      setError(error);
    }
    isMounted.current && setLoading(false);
  };

  return (
    <div className="app flex-row align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md="6">
            <Card className="p-4">
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  <h1>Login</h1>
                  <p className="text-muted">Sign In to your account</p>
                  {error && <Alert color="danger">{error.message}</Alert>}
                  <InputGroup className="mb-3">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="fa fa-user-secret"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      type="text"
                      name="alias"
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                      placeholder="Alias"
                      required
                    />
                  </InputGroup>
                  <InputGroup className="mb-4">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="fa fa-key"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      type={isPasswordVisible ? "text" : "password"}
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                    />
                    <InputGroupAddon addonType="append">
                      <InputGroupText
                        onClick={() =>
                          setPasswordVisibility(!isPasswordVisible)
                        }
                      >
                        {isPasswordVisible ? (
                          <i className="fa fa-eye-slash"></i>
                        ) : (
                          <i className="fa fa-eye"></i>
                        )}
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <Row>
                    <Col xs="6">
                      <Button
                        type="submit"
                        color="primary"
                        className="px-4"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <i className="fa fa-refresh fa-spin fa-fw" />
                        ) : (
                          "Login"
                        )}
                      </Button>
                    </Col>
                    {/* <Col xs="6" className="text-right">
                      <Button type="button"
                        onClick={() => this.props.history.push('/forgot-password')}
                        color="link"
                        className="px-0"
                      >
                        Forgot password?
                      </Button>
                    </Col> */}
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default withAuthorization("/")(Login);
