import jwt from 'jsonwebtoken';
import { User, Restaurant } from '../models/User.js'; // Import both User and Restaurant models
import multer from 'multer'; // Import Multer
import path from 'path';

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save uploaded files to the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`); // Name the file with the current timestamp to avoid conflicts
    }
});

// Image validation (ensure only image files are uploaded)
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
        cb(null, true); // Accept only .jpg, .jpeg, or .png files
    } else {
        cb(new Error('Only image files (jpg, jpeg, png) are allowed')); // Reject files with incorrect format
    }
};

// Set limits for the uploaded files (e.g., max size 5MB)
const limits = {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
};

// Multer middleware to handle image uploads
export const upload = multer({
    storage,
    fileFilter,
    limits,
});

// Authenticate user based on JWT
export const authenticateUser = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Extract token from Authorization header
    // console.log("Token received:", token);  // Debug: Check if token is being received

    if (!token) {
        return res.status(401).send({ "status": "failed", "message": "Access Denied. No Token Provided!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Verify token
        req.userID = decoded.userID; // Attach userID from token to request
        req.role = decoded.role; // Attach user role from token to request
        next();
    } catch (error) {
        res.status(400).send({ "status": "failed", "message": "Invalid Token" });
    }
};

// Authorize user role (e.g., only owner or employee)
export const authorizeRole = (role) => {
    return (req, res, next) => {
        if (req.role !== role) {
            return res.status(403).send({ "status": "failed", "message": "Access Denied. You do not have the required role!" });
        }
        next();
    };
};

// Attach restaurant ID based on authenticated user
export const setRestaurantID = async (req, res, next) => {
    try {
        const userID = req.userID; // Extract userID from the authenticated user
        
        // Find the restaurant associated with this user
        const restaurant = await Restaurant.findOne({ owner_id: userID });
        
        if (!restaurant) {
            return res.status(404).send({ "status": "failed", "message": "Restaurant not found for the user" });
        }

        // Attach the restaurant ID to the request object
        req.restaurantID = restaurant._id;
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).send({ "status": "failed", "message": "Server error" });
    }
};

// Middleware to verify employee and restaurant association
export const verifyEmployeeRestaurant = async (req, res, next) => {
    try {
        const { restaurant_id } = req.body; // Get restaurant ID from request body
        const userID = req.userID; // Get userID from authentication middleware
  
        // Fetch the user details (only allow employees)
        const user = await User.findById(userID);
  
        if (!user || user.role !== 'employee') {
            return res.status(403).json({
                status: 'failed',
                message: 'Unauthorized access'
            });
        }
  
        // Check if the provided restaurant_id exists in the database
        const restaurant = await Restaurant.findById(restaurant_id);
  
        if (!restaurant) {
            return res.status(404).json({
                status: 'failed',
                message: 'Restaurant not found'
            });
        }
  
        // Proceed if the checks pass
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'failed',
            message: 'Internal server error'
        });
    }
};
