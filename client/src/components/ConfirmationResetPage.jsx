import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';

const ConfirmationResetPage = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const confirmReset = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setError(true);
        setMessage('Invalid reset link');
        return;
      }

      try {
        const response = await apiClient.post(`/reset-password?token=${token}`);
        setMessage(response.data.message);
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setError(true);
        setMessage(err.response?.data?.message || 'An error occurred');
      }
    };

    confirmReset();
  }, [searchParams, navigate]);

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row className="w-100">
        <Col sm={12} md={6} lg={4} className="mx-auto">
          <Alert variant={error ? 'danger' : 'success'}>
            {message}
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default ConfirmationResetPage;
