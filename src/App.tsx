import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { Homepage } from './components/Homepage';
import { Checkout } from './components/Checkout';
import { Payment } from './components/Payment';
import { ClaimForm } from './components/ClaimForm';
import './components/ClaimForm.css';

// Configure Apollo Client
const client = new ApolloClient({
  uri: 'YOUR_GRAPHQL_ENDPOINT_HERE', // Replace with your actual GraphQL endpoint
  cache: new InMemoryCache(),
  // Add authentication if needed
  headers: {
    // authorization: `Bearer ${YOUR_AUTH_TOKEN}`,
  },
});

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/claim" element={<ClaimForm />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
