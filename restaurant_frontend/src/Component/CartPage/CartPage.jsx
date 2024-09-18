import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CartPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch cart details if not passed from MenuPage
    if (!location.state?.cart) {
      axios.get('http://localhost:8000/api/user/viewcart')
        .then(response => {
          setCart(response.data.cart);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching cart:', error);
          setLoading(false);
        });
    } else {
      setCart(location.state.cart);
      setLoading(false);
    }
  }, [location.state?.cart]);

  const handleGuestCheckout = () => {
    // Implement guest checkout process
    // Redirect to guest checkout page or API
    navigate('/guest-checkout');
  };

  const handleLogin = () => {
    navigate('/signin');
  };

  const handlePlaceOrder = () => {
    // Assuming user authentication is handled and userID is available
    axios.post('http://localhost:8000/api/user/placeorder', { restaurant_id: 'someID', table_id: 'someID' })
      .then(response => {
        // Handle successful order placement
        navigate('/order-success'); // Redirect to an order success page
      })
      .catch(error => {
        console.error('Error placing order:', error);
      });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Cart Page</h1>
      {cart.length > 0 ? (
        <div>
          <h2>Items in Cart:</h2>
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                Item Name: {item.item_name}, Quantity: {item.quantity}, Price: {item.price}
              </li>
            ))}
          </ul>
          <button onClick={handleGuestCheckout}>Continue as Guest</button>
          <button onClick={handleLogin}>Login</button>
          <button onClick={handlePlaceOrder}>Place Order</button>
        </div>
      ) : (
        <p>No items in cart.</p>
      )}
    </div>
  );
};

export default CartPage;
