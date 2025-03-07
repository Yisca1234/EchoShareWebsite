import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';
const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const res = await apiClient.post("/request-password-reset", {
      email: formData.email,
      newPassword: formData.newPassword
    });
    setMessage(res.data.message);
    setLoading(false);

    // try {
    //   const res = await apiClient.post("/request-password-reset", {
    //     email: formData.email,
    //     newPassword: formData.newPassword
    //   });

      
    //   setMessage('Password reset email has been sent. Please check your inbox.');
    // } catch (error) {
    //   setMessage('Error sending reset email. Please try again.');
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row className="w-100">
        <Col sm={12} md={6} lg={4} className="mx-auto">
          <div className="text-center mb-4">
            <Image src="echoShareBlack.png" alt="Logo" rounded style={{ width: '70px', height: '70px' }} />
            <h3 style={{ marginTop: '12px' }}>Reset Password</h3>
          </div>
          
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="emailContainer">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="newPasswordContainer" className="mt-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading} 
              className={`mt-4 w-100 ${loading && 'loading1'}`}
            >
              Send Reset Email
            </Button>

            {message && (
              <>
                <div className={`text-center mt-3 ${message.includes('Error') ? 'text-danger' : 'text-success'}`}>
                  {message}
                </div>
                <Button 
                  variant="outline-secondary"
                  size="sm"
                  className="d-block mx-auto mt-2"
                  onClick={() => setMessage('')}
                >
                  Okay
                </Button>
              </>
            )}

            <div className="text-center mt-3">
              <small>
                Remember your password or confirm the email sent?{' '}
                <Link to="/login">Back to Login</Link>
              </small>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
