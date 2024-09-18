import { Order, Table, MenuItem } from '../models/User.js';
// import { Table } from '../models/Table.js';

class OrderController {

    // Send OTP for guest user verification
static sendOTP = async (req, res) => {
    const { phone_number } = req.body;
    
    // Generate a random OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    // Store OTP in session or database with an expiration time
    req.session.otp = otp;

    // Simulate sending OTP (e.g., via Twilio, etc.)
    console.log(`Sending OTP: ${otp} to phone number: ${phone_number}`);
    
    res.send({ "status": "Success", "message": "OTP sent successfully", "otp": otp });
};

// Verify OTP
static verifyOTP = async (req, res) => {
    const { otp } = req.body;

    if (otp === req.session.otp) {
        res.send({ "status": "Success", "message": "OTP verified" });
    } else {
        res.status(400).send({ "status": "failed", "message": "Invalid OTP" });
    }
};



    // Place a new order
static placeOrder = async (req, res) => {
        const userID = req.userID;
        const { restaurant_id, table_id } = req.body;
        const cart = req.session.cart || [];

        if (cart.length === 0) {
            return res.status(400).send({ "status": "failed", "message": "Cart is empty" });
        }

        try {
            // Check if the table is already occupied
            const table = await Table.findById(table_id);
            if (!table || table.is_occupied) {
                return res.status(400).send({ "status": "failed", "message": "Table is already occupied or not found" });
            }

            // Calculate total amount based on cart
            const total_amount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

            // Create the order
            const newOrder = new Order({
                restaurant_id: restaurant_id,
                table_id: table_id,
                customer_id: userID,
                status: 'pending',
                total_amount: total_amount,
                items: cart // Storing the cart items in the order
            });

            // Mark the table as occupied
            table.is_occupied = true;
            await table.save();

            await newOrder.save();

            // Clear the session cart after order is placed
            req.session.cart = [];

            res.status(201).send({ "status": "Success", "message": "Order placed successfully", "order": newOrder });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "status": "failed", "message": "Unable to place order" });
        }
    }
    // Add to cart function
    static addToCart = async (req, res) => {
        const { item_id, quantity } = req.body;

        try {
            // Find the menu item
            const item = await MenuItem.findById(item_id);

            if (!item) {
                return res.status(404).send({ "status": "failed", "message": "Item not found" });
            }

            // Initialize session cart if not exists
            req.session.cart = req.session.cart || [];

            // Check if item is already in the cart
            const existingItem = req.session.cart.find(i => i.item_id === item_id);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                req.session.cart.push({
                    item_id: item_id,
                    item_name: item.item_name,
                    price: item.price,
                    quantity: quantity
                });
            }

            res.status(200).send({ "status": "success", "message": "Item added to cart", "cart": req.session.cart });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "status": "failed", "message": "Unable to add item to cart" });
        }
    }

    // View cart function (for customer)
    static viewCart = (req, res) => {
        const cart = req.session.cart || [];
        res.status(200).send({ "status": "success", "cart": cart });
    }

    // Other methods like updateOrderStatus, getOrdersForCustomer, etc., remain the same  
 // Update order status (for staff)
    static updateOrderStatus = async (req, res) => {
        const { orderID, status } = req.body;

        try {
            const order = await Order.findById(orderID);

            if (!order) {
                return res.status(404).send({ "status": "failed", "message": "Order not found" });
            }

            order.status = status;
            await order.save();

            // If order is completed or cancelled, mark the table as not occupied
            if (status === 'completed' || status === 'cancelled') {
                const table = await Table.findById(order.table_id);
                table.is_occupied = false;
                await table.save();
            }

            res.send({ "status": "Success", "message": "Order status updated successfully", "order": order });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "status": "failed", "message": "Unable to update order status" });
        }
    }

    // Get all orders for a customer
    static getOrdersForCustomer = async (req, res) => {
        const userID = req.userID;

        try {
            const orders = await Order.find({ customer_id: userID }).populate('restaurant_id table_id');

            res.send({ "status": "Success", "orders": orders });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "status": "failed", "message": "Unable to fetch orders" });
        }
    }

    // Get all orders for a restaurant
    static getOrdersForRestaurant = async (req, res) => {
        const restaurantID = req.restaurantId;
      
        try {
          // Fetch orders for the restaurant
          const orders = await Order.find({ restaurant_id: req.restaurantID })
            .populate('table_id') // Populate table details (select only table_number)
            .populate('customer_id')  // Populate customer details (select only username)
            .populate({
              path: 'items.item_id', // Populate the item_id field in items
              select: 'item_name price' // Select only item_name and price from MenuItem
            })
            .exec();
        //   console.log(orders)
          // Format the orders to return in the response
          const formattedOrders = orders.map(order => ({
            _id: order._id,
            customer_name: order.customer_id ? order.customer_id.username : 'N/A',
            table_number: order.table_id ? order.table_id.table_number : 'N/A',
            items: order.items.map(item => ({
              item_name: item.item_id ? item.item_id.item_name : 'N/A',
              price: item.item_id ? item.item_id.price : 0,
              quantity: item.quantity
            })),
            order_date: order.order_date,
            status: order.status,
            total_amount: order.total_amount
          }));
      
          return res.status(200).json({
            status: "Success",
            orders: formattedOrders
          });
        } catch (error) {
          console.error("Error fetching orders for restaurant:", error);
          return res.status(500).json({
            status: "Error",
            message: "Failed to fetch orders for the restaurant"
          });
        }
      };
      


     // Update order with completion time
     static updateOrderCompletionTime = async (req, res) => {
        const { orderID, time_taken } = req.body;

        try {
            const order = await Order.findById(orderID);

            if (!order) {
                return res.status(404).send({ "status": "failed", "message": "Order not found" });
            }

            order.time_taken = time_taken; // Assuming you add this field in the Order model
            await order.save();

            res.send({ "status": "Success", "message": "Order completion time updated", "order": order });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "status": "failed", "message": "Unable to update order completion time" });
        }
    }

    // Fetch orders with status filter (e.g., completed, pending)
    static getOrdersByStatus = async (req, res) => {
        const restaurantID = req.restaurantID;
        const { status } = req.query; // e.g., ?status=completed

        try {
            const orders = await Order.find({ restaurant_id: restaurantID, status: status })
                .populate('table_id customer_id')
                .exec();

            res.send({ "status": "Success", "orders": orders });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "status": "failed", "message": "Unable to fetch orders by status" });
        }
    }
}

export default OrderController;
