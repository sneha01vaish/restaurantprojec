import { Restaurant, MenuItem, MenuCategory, Table, Order } from '../models/User.js';
import path from 'path';
import fs from 'fs';

// Utility function to handle image upload path
const getImagePath = (file) => {
    return file ? `/uploads/${file.filename}` : null;
};

class RestaurantController {
    // Complete owner profile
    static completeProfile = async (req, res) => {
        const userID = req.userID;
        const { name, address, contact_number, social_media_links, description, type } = req.body;
        const logo_url = getImagePath(req.file);  // Handle image upload

        try {
            const restaurant = await Restaurant.findOneAndUpdate(
                { owner_id: userID },
                { name, address, contact_number, social_media_links, description, type, logo_url },
                { upsert: true, new: true }
            );

            res.send({ "status": "Success", "message": "Profile completed successfully", "restaurant": restaurant });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "status": "failed", "message": "Unable to complete profile" });
        }
    };

    static getProfile = async (req, res) => {
        const userID = req.userID;
    
        try {
            const restaurant = await Restaurant.findOne({ owner_id: userID });
    
            if (!restaurant) {
                return res.status(404).send({ status: 'failed', message: 'Profile not found' });
            }
    
            res.send({ status: 'Success', restaurant });
        } catch (error) {
            console.error(error);
            res.status(500).send({ status: 'failed', message: 'Unable to fetch profile' });
        }
    };
    
    // Add category of dishes
    static addCategory = async (req, res) => {
        const { restaurantID } = req;
        const { category_name } = req.body;
    
        try {
            // Check if category already exists for the restaurant
            const existingCategory = await MenuCategory.findOne({ restaurant_id: restaurantID, category_name });
            if (existingCategory) {
                return res.status(400).send({ "status": "failed", "message": "Category already exists" });
            }
    
            const newCategory = new MenuCategory({
                restaurant_id: restaurantID,
                category_name
            });
    
            await newCategory.save();
    
            res.status(201).send({ "status": "Success", "message": "Category added successfully", "category": newCategory });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "status": "failed", "message": "Unable to add category" });
        }
    };

    // Employee updates category
    static updateCategory = async (req, res) => {
        const { categoryID } = req.params;
        const { category_name } = req.body;

        try {
            const category = await MenuCategory.findByIdAndUpdate(categoryID, { category_name }, { new: true });
            if (!category) {
                return res.status(404).send({ "status": "failed", "message": "Category not found" });
            }

            res.send({ "status": "Success", "message": "Category updated successfully", "category": category });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "status": "failed", "message": "Unable to update category" });
        }
    };

    // Employee deletes category
    static deleteCategory = async (req, res) => {
        const { categoryID } = req.params;

        try {
            await MenuCategory.findByIdAndDelete(categoryID);
            res.send({ "status": "Success", "message": "Category deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "status": "failed", "message": "Unable to delete category" });
        }
    };

    // Add a new menu item (with image upload)
    // Add a new menu item (with image upload)
    static addMenuItem = async (req, res) => {
        const { category_name, item_name, description, price } = req.body;
        const image_url = getImagePath(req.file); // Handle image upload
    
        try {
            // Find the category by its name and restaurant ID
            const category = await MenuCategory.findOne({
                restaurant_id: req.restaurantID, // Ensure the restaurant matches
                category_name, // Find by category name
            });
    
            if (!category) {
                return res.status(404).send({ "status": "failed", "message": "Category not found" });
            }
    
            // Check if an item with the same name already exists in the category
            const existingItem = await MenuItem.findOne({
                category_id: category._id, // Use the found category's ID
                item_name,
            });
    
            if (existingItem) {
                return res.status(400).send({ "status": "failed", "message": "Menu item already exists in this category" });
            }
    
            // Create a new MenuItem with the found category ID
            const newItem = new MenuItem({
                category_id: category._id, // Use the found category's ID
                restaurant_id: req.restaurantID, // Use the authenticated restaurant ID
                category_name, // Save the category name
                item_name,
                description,
                price,
                image_url,
            });
    
            // Save the new menu item to the database
            await newItem.save();
    
            res.status(201).send({
                "status": "Success",
                "message": "Menu item added successfully",
                "item": newItem,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "status": "failed", "message": "Unable to add menu item" });
        }
    };
    
    // Update menu item
    static updateMenuItem = async (req, res) => {
        const { itemID } = req.params;
        const { item_name, description, price } = req.body;
        const image_url = getImagePath(req.file); // Handle image upload

        try {
            const item = await MenuItem.findByIdAndUpdate(itemID, {
                item_name,
                description,
                price,
                image_url
            }, { new: true });

            if (!item) {
                return res.status(404).send({ "status": "failed", "message": "Menu item not found" });
            }

            res.send({ "status": "Success", "message": "Menu item updated successfully", "item": item });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "status": "failed", "message": "Unable to update menu item" });
        }
    };

    // Delete menu item
    static deleteMenuItem = async (req, res) => {
        const { itemID } = req.params;

        try {
            await MenuItem.findByIdAndDelete(itemID);
            res.send({ "status": "Success", "message": "Menu item deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "status": "failed", "message": "Unable to delete menu item" });
        }
    };

    // Fetch categories
    static getCategories = async (req, res) => {
        try {
            const categories = await MenuCategory.find({ restaurant_id: req.restaurantID });
            res.send({ "status": "Success", "categories": categories });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "status": "failed", "message": "Unable to fetch categories" });
        }
    };

    // Fetch Items for a Category
    static getItemsForCategory = async (req, res) => {
        const { categoryID } = req.params;

        try {
            const items = await MenuItem.find({ category_id: categoryID });
            res.send({ "status": "Success", "items": items });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "status": "failed", "message": "Unable to fetch items" });
        }
    };

    // Add table
    static addTable = async (req, res) => {
        const { restaurantID } = req;
        const { table_number, capacity } = req.body;

        try {
            const newTable = new Table({
                restaurant_id: restaurantID,
                table_number,
                capacity
            });

            await newTable.save();

            res.status(201).send({ "status": "Success", "message": "Table added successfully", "table": newTable });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "status": "failed", "message": "Unable to add table" });
        }
    };

    // Fetch tables for a restaurant
    static getTables = async (req, res) => {
        const restaurantID = req.restaurantID;

        try {
            const tables = await Table.find({ restaurant_id: restaurantID });
            res.send({ "status": "Success", "tables": tables });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "status": "failed", "message": "Unable to fetch tables" });
        }
    };

    // Fetch orders for a restaurant with table details
    static getOrdersWithTableDetails = async (req, res) => {
        const restaurantID = req.restaurantID;

        try {
            const orders = await Order.find({ restaurant_id: restaurantID })
                .populate('table_id')
                .populate('customer_id')
                .exec();

            res.send({ "status": "Success", "orders": orders });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "status": "failed", "message": "Unable to fetch orders" });
        }
    };

    static getMenuForQR = async (req, res) => {
        const { restaurant_id, table_id } = req.query;
    
        try {
            // Fetch restaurant details and menu
            const restaurant = await Restaurant.findById(restaurant_id);
            const menu = await MenuItem.find({ restaurant_id: restaurant_id });
    
            if (!restaurant) {
                return res.status(404).send({ "status": "failed", "message": "Restaurant not found" });
            }
    
            res.send({
                "status": "Success",
                "restaurant": restaurant,
                "menu": menu,
                "table_id": table_id
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "status": "failed", "message": "Unable to fetch menu" });
        }
    };


    static getMenu = async (req, res) => {
        try {
            const restaurantID = req.restaurantID; // Set in middleware
            // console.log('Fetching menu for restaurant ID:', restaurantID); // Log restaurant ID

            // Fetch menu items along with the associated category
            const menuItems = await MenuItem.find({ restaurant_id: restaurantID })
                .populate('category_id', 'category_name') // Populate category_name from MenuCategory
                .exec();

            if (menuItems.length === 0) {
                return res.json({ success: true, message: 'No menu items found', categories: [] });
            }

            // Format the menu items with category names
            const formattedMenu = menuItems.map(item => ({
                item_name: item.item_name,
                description: item.description,
                price: item.price,
                category_name: item.category_id ? item.category_id.category_name : 'Uncategorized', // Handle category if not found
            }));

            res.json({ success: true, categories: formattedMenu });
        } catch (error) {
            console.error('Error fetching menu:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch menu' });
        }
    };


}

export default RestaurantController;
