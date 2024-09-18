import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GuestCheckout = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  
  const handleSendOtp = async () => {
    try {
      await axios.post('http://localhost:8000/api/user/send-otp', { phone });
      setSuccessMessage('OTP sent successfully.');
    } catch (error) {
      setErrorMessage('Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await axios.post('http://localhost:8000/api/user/verify-otp', { phone, otp });
      await axios.post('http://localhost:8000/api/order/place', { name, phone });
      setSuccessMessage('Order placed successfully! Wait a few minutes, and we will get back to you.');
      setTimeout(() => navigate('/'), 3000); // Redirect after 3 seconds
    } catch (error) {
      setErrorMessage('OTP verification failed.');
    }
  };

  return (
    <div>
      <h1>Guest Checkout</h1>
      <div>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button onClick={handleSendOtp}>Send OTP</button>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button onClick={handleVerifyOtp}>Verify OTP & Place Order</button>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      </div>
    </div>
  );
};

export default GuestCheckout;
