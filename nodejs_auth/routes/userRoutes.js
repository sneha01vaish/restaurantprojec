import express from 'express';
import UserController from '../controllers/userController.js';
import RestaurantController from '../controllers/RestaurantController.js';
import OrderController from '../controllers/OrderController.js';
import { authenticateUser, authorizeRole, setRestaurantID, verifyEmployeeRestaurant, upload } from '../middlewares/AuthMiddleware.js';
import DashboardController from '../controllers/DashboardController.js';

const router = express.Router();

// User Routes
router.post('/register', UserController.userRegistration);
router.post('/login', UserController.userLogin);
router.get('/verify-email', UserController.verifyEmail);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);

// Restaurant Routes
router.post('/restaurant/profile', authenticateUser, authorizeRole('owner'), upload.single('image'), RestaurantController.completeProfile);
router.get('/restaurant/getprofile', authenticateUser, authorizeRole('owner'), upload.single('image'), RestaurantController.getProfile);

router.post('/restaurant/menu', authenticateUser, authorizeRole('owner'), upload.single('image_url'), setRestaurantID, RestaurantController.addMenuItem);
router.get('/restaurant/menulist', authenticateUser, authorizeRole('owner', 'employee'), setRestaurantID, RestaurantController.getMenu);
router.put('/restaurant/menu/:itemID', authenticateUser, authorizeRole('employee'), upload.single('image'), verifyEmployeeRestaurant, RestaurantController.updateMenuItem);
router.delete('/restaurant/menu/:itemID', authenticateUser, authorizeRole('employee'), verifyEmployeeRestaurant, RestaurantController.deleteMenuItem);
router.get('/restaurant/gettables', authenticateUser, authorizeRole('owner'), setRestaurantID, RestaurantController.getTables);
router.get('/restaurant/orders/details', authenticateUser, authorizeRole('owner'), RestaurantController.getOrdersWithTableDetails);
router.get('/dashboard', authenticateUser, authorizeRole('owner'), DashboardController.getDashboardData);
router.put('/order/completion-time', authenticateUser, authorizeRole('employee'), OrderController.updateOrderCompletionTime);
router.get('/orders/status', authenticateUser, authorizeRole('employee'), OrderController.getOrdersByStatus);
router.post('/restaurant/category', authenticateUser, authorizeRole('owner'), setRestaurantID, RestaurantController.addCategory);
router.put('/restaurant/category/:categoryID', authenticateUser, authorizeRole('employee'), verifyEmployeeRestaurant, RestaurantController.updateCategory);
router.delete('/restaurant/category/:categoryID', authenticateUser, authorizeRole('employee'), verifyEmployeeRestaurant, RestaurantController.deleteCategory);
router.get('/restaurant/categories', authenticateUser, authorizeRole('owner'), setRestaurantID, RestaurantController.getCategories);
router.get('/restaurant/category/:categoryID/items', authenticateUser, authorizeRole('owner', 'employee'), verifyEmployeeRestaurant, RestaurantController.getItemsForCategory);
router.post('/restaurant/table', authenticateUser, authorizeRole('owner'), setRestaurantID, RestaurantController.addTable);

// Order Routes
router.post('/order', authenticateUser, authorizeRole('customer'), OrderController.placeOrder);
router.post('/cart/add', OrderController.addToCart);
router.get('/viewcart', authenticateUser, authorizeRole('customer'), OrderController.viewCart);

router.put('/order/status', authenticateUser, authorizeRole('employee'), OrderController.updateOrderStatus);
router.get('/customer/orders', authenticateUser, authorizeRole('customer'), OrderController.getOrdersForCustomer);
router.get('/restaurant/orders', authenticateUser, authorizeRole('owner'), setRestaurantID, OrderController.getOrdersForRestaurant);

// QR Menu Route
router.get('/restaurant/qr/menu', RestaurantController.getMenuForQR);

export default router;
