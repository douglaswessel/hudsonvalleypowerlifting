import React from 'react';
import { Link } from 'react-router-dom';

export const Homepage: React.FC = () => {
  return (
    <div className="homepage">
      <h1>Welcome</h1>
      <nav>
        <ul>
          <li><Link to="/checkout">Checkout</Link></li>
          <li><Link to="/payment">Payment</Link></li>
          <li><Link to="/claim">Submit a Claim</Link></li>
        </ul>
      </nav>
    </div>
  );
};
