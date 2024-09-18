import React, { useState, useEffect } from 'react';
import axios from 'axios';
import style from './orders.module.css';

const OrderSection = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/user/restaurant/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data.orders);
      } catch (error) {
        console.log('Error fetching orders:', error);
      }
    };
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/order/status`, {
        orderID: orderId,
        status,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedOrders = orders.map((order) => {
        if (order._id === orderId) {
          return { ...order, status };
        }
        return order;
      });

      setOrders(updatedOrders);
    } catch (error) {
      console.log('Error updating order status:', error);
    }
  };

  return (
    <div className={style.OrderWrapper}>
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">SL No</th>
            <th scope="col">Customer Name</th> {/* Added column for Customer Name */}
            <th scope="col">Table Number</th> {/* Added column for Table Number */}
            <th scope="col">Item Name</th>
            <th scope="col">Price</th>
            <th scope="col">Quantity</th>
            <th scope="col">Order Date</th>
            <th scope="col">Status</th>
            <th scope="col">Total Amount</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order._id}>
              <td>{index + 1}</td>
              <td>{order.customer_name}</td> {/* Display Customer Name */}
              <td>{order.table_number}</td> {/* Display Table Number */}
              <td>{order.items.map(item => item.item_name).join(', ')}</td> {/* Display Item Names */}
              <td>{order.items.map(item => item.price).join(', ')}</td> {/* Display Prices */}
              <td>{order.items.map(item => item.quantity).join(', ')}</td> {/* Display Quantities */}
              <td>{new Date(order.order_date).toLocaleDateString()}</td>
              <td>
                <button
                  className={`btn ${order.status === 'completed' ? 'btn-success' : 'btn-warning'} text-white`}
                  onClick={() => handleUpdateStatus(order._id, order.status === 'completed' ? 'completed' : 'completed')}
                >
                  {order.status === 'completed' ? 'Completed' : 'Pending'}
                </button>
              </td>
              <td>{order.total_amount}</td>
              <td>
                <button
                  className='btn btn-warning text-white'
                  onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                >
                  Cancel Order
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderSection;
