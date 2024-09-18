 // axios.get(`http://localhost:8000/api/user/restaurant/qr/menu?restaurant_id=66d8c46e7866635cfff9a55e&table_id=66defe68113ff042862aff4d`)
 import React, { useState, useEffect } from 'react';
 import { Grid, Card, Button } from "@mui/material";
 import axios from 'axios';
 import { useNavigate } from 'react-router-dom';
 import Nav from '../Nav/Nav';
 
 function MenuPage() {
   const [menu, setMenu] = useState([]);
   const [quantities, setQuantities] = useState({});
   const navigate = useNavigate();
 
   useEffect(() => {
     const queryParams = new URLSearchParams(window.location.search);
     const restaurantID = queryParams.get('restaurant_id');
     const tableID = queryParams.get('table_id');
      axios.get(`http://localhost:8000/api/user/restaurant/qr/menu?restaurant_id=66d8c46e7866635cfff9a55e&table_id=66defe68113ff042862aff4d`)
      .then(response => {
         setMenu(response.data.menu);
       })
       .catch(error => {
         console.error('Error fetching menu:', error);
       });
   }, []);
 
   const handleIncrement = (itemId) => {
     setQuantities(prev => {
      const newQuantity = (prev[itemId] || 0) + 1;
      //  return { ...prev, [itemId]: newQuantity };
      const updatedCart = { ...prev, [itemId]: newQuantity };
      localStorage.setItem('cart', JSON.stringify(updatedCart));
  
      return updatedCart;
     });
 
     axios.post('http://localhost:8000/api/user/cart/add', { item_id: itemId, quantity: 1 }, {
         headers: {
             'Authorization': `Bearer ${localStorage.getItem('token')}`
         }
     })
     .catch(error => {
         console.error('Error adding item to cart:', error);
     });
   };
 
   const handleDecrement = (itemId) => {
     setQuantities(prev => {
       const newQuantity = Math.max((prev[itemId] || 0) - 1, 0);
       return { ...prev, [itemId]: newQuantity };
     });
 
     axios.post('http://localhost:8000/api/user/cart/add', { item_id: itemId, quantity: -1 }, {
         headers: {
             'Authorization': `Bearer ${localStorage.getItem('token')}`
         }
     })
     .catch(error => {
         console.error('Error updating item quantity in cart:', error);
     });
   };

 
  //  const placeOrderAsGuest = () => {
  //    const orderItems = Object.entries(quantities).map(([itemId, quantity]) => ({
  //        item_id: itemId,
  //        quantity: quantity,
  //    }));
 
  //    console.log("Order Items as Guest:", orderItems); // Log order items
 
  //    axios.post('http://localhost:8000/api/user/order', { items: orderItems })
  //    .then(response => {
  //        console.log('Order successfully placed as guest:', response.data);
  //        navigate('/'); 
  //    })
  //    .catch(error => {
  //        console.error('Error placing order as guest:', error.response?.data || error.message);
  //    });
  //  };
 
    const placeOrder = async () => {
      const token = localStorage.getItem('token'); // Check if the user is logged in
      const cart = JSON.parse(localStorage.getItem('cart')); // Get cart data

      if (!cart || Object.keys(cart).length === 0) {
        alert("Cart is empty");
        return; // Exit if cart is empty
      }
      console.log(cart)
      
      if (!token) {
        // User not logged in, ask to login or continue as guest
        const continueAsGuest = window.confirm("You are not logged in. Do you want to continue as a guest?");
        if (continueAsGuest) {
          navigate('/guest-user'); // Redirect to guest user page
        } else {
          navigate('/signin'); // Redirect to login page
        }
      } else {
        // User is logged in, place the order
        const orderItems = Object.entries(quantities).map(([itemId, quantity]) => ({
          item_id: itemId,
          quantity: quantity,
        
        }));
        const newItems = { restaurant_id:"66d8c46e7866635cfff9a55e",
          table_id:"66d8cc713bd77bdf89803133",
          total_amount: 500,
          items:`${orderItems}`
         }
        console.log(newItems)
  
        if (orderItems.length === 0) {
          alert('Your cart is empty. Please add items before placing an order.');
          return;
        }
       console.log(orderItems)
        await axios.post('http://localhost:8000/api/user/order', newItems, {
          headers: { 
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI2NmQ3ZThlZGMwNTE2YWNkMjliNmU1MjEiLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3MjY2MzM1NTIsImV4cCI6MTcyNjY2OTU1Mn0.xstdrL8BfHJE4o_F51SpIc480uLeiKoY9iuxFdS6SHo`,
            'Accept': 'application/json'
          },
          withCredentials: true
        })
        .then(response => {
          // Show success message
          alert('Congratulations! Your order has been placed successfully.');
          navigate('/'); // Redirect to home or success page
        })
        .catch(error => {
          console.error('Error placing order:', error.response?.data || error.message);
        });
      }
    };
   return (
     <div>
       <Nav />
       <Grid container direction="row" justifyContent="center" textAlign="center" alignItems="center" p={10}>
         <Grid container lg={12} sm={12} direction="row" justifyContent="center" spacing={6}>
           {menu.map(item => (
             <Grid item lg={3} sm={6} key={item._id} textAlign="center">
               <Card style={{ height: "100%", width: "90%", padding: "10px", border: "3px solid green", boxShadow: "0px 0px 20px black", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                 <img src={item.image_url} alt={item.item_name} width="50%" style={{ marginTop: "20px" }} />
                 <Grid style={{ display: "flex", height: "35px", justifyContent: "space-around", alignItems: "center" }}>
                   <h1 style={{ color: "goldenrod", paddingBottom: "-70px", marginTop: "20px" }}>{item.item_name}</h1>
                   <Grid style={{ height: "100%", width: "40%", marginLeft: "20px", border: "2px solid gold", backgroundColor: "rgba(0, 0, 0, .3)", marginTop: "20px", display: "flex", alignItems: "center", justifyContent: "space-evenly", borderRadius: "5px" }}>
                     <button onClick={() => handleDecrement(item._id)} style={{ color: "white", fontWeight: "700", height: "20px", width: "20px", backgroundColor: "rgba(0, 0, 0, .3)", border: "1px solid grey", borderRadius: "3px" }}>-</button>
                     <span style={{ height: "20px", width: "20px", fontWeight: "700", color: "white" }}>{quantities[item._id] || 0}</span>
                     <button onClick={() => handleIncrement(item._id)} style={{ color: "white", fontWeight: "700", height: "20px", width: "20px", backgroundColor: "rgba(0, 0, 0, .3)", border: "1px solid grey", borderRadius: "3px" }}>+</button>
                   </Grid>
                 </Grid>
                 <h3 style={{ color: "rgb(206, 200, 200)", marginTop: "30px" }}>Price: {item.price}</h3>
               </Card>
             </Grid>
           ))}
         </Grid>
         <Button onClick={placeOrder} variant="contained" color="primary">Place Order</Button>

       </Grid>
     </div>
   );
 }
 
 export default MenuPage;
 