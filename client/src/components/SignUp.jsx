import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Image } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../redux/auth/actions.js';
import { selectAuthError,isAuthenticated  } from '../redux/auth/selectors';
import { isExists  } from '../redux/user/selectors';




const SignUp = () => {
  const [formData, setFormData] = useState({
    emailUser: '',
    password: '',
    passwordConfirmed: '',
  });
  const [someError, setSomeError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const dispatch = useDispatch();
  const authError = useSelector(selectAuthError);
  const authenticated = useSelector(isAuthenticated);
  const avatarExists = useSelector(isExists);

  const handleLoading = (state) => {
    setLoading(state);
  }

  useEffect(() => {
    if (authenticated && avatarExists) {
      navigate('/home');
    }
  }, [authenticated, avatarExists, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleLoading(true);

    if (formData.password !== formData.passwordConfirmed) {
      setSomeError('The two passwords are different');
      setLoading(false);
      return;
    }

    await dispatch(register(formData.emailUser, formData.password));
    setSomeError(null);
    handleLoading(false);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row className="w-100">
        <Col sm={12} md={6} lg={4} className="mx-auto">
          <div className="text-center mb-4">
            <Image src="echoShareBlack.png" alt="twitter Logo" rounded style={{ width: '60px', height: '60px' }} />
            <h3 style={{ marginTop: '12px' }}>SignUp</h3>
          </div>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="UserEmailContainer">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="emailUser"
                value={formData.emailUser}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="newPasswordContainer" className="mt-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="confirmPasswordContainer" className="mt-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="passwordConfirmed"
                value={formData.passwordConfirmed}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading} className={`mt-4 w-100 ${loading && 'loading1'}`}>
              SignUp
            </Button>

            {someError ? (
              <div className="text-danger text-center mt-3">
                {someError}
              </div>
            ) :
            authError && (
              <div className="text-danger text-center mt-3">
                {authError}
              </div>
            )
            }

            <div className="text-center mt-3">
              <small>
                Already have an account?{' '}
                <Link to="/login">Login here</Link>
              </small>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};


export default SignUp