import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForms from '../components/AuthForms';

export function Login() {
  const navigate = useNavigate();

  return (
    <AuthForms onSuccess={() => navigate('/')} />
  );
}

export default Login;
