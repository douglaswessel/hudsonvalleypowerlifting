import React from 'react';
import { Link } from 'react-router-dom';

export const Payment: React.FC = () => {
  return (
    <div className="payment">
      <h1>Payment</h1>
      <p>Enter your payment details to complete the order.</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
};
