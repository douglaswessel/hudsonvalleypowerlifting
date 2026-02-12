import React from 'react';
import { Link } from 'react-router-dom';

export const Checkout: React.FC = () => {
  return (
    <div className="checkout">
      <h1>Checkout</h1>
      <p>Review your order before proceeding to payment.</p>
      <Link to="/payment">Proceed to Payment</Link>
    </div>
  );
};
