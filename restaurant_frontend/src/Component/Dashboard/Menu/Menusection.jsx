import React, { useState, useEffect } from 'react';
import axios from 'axios';
import style from './menu.module.css';

const MenuSection = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newItem, setNewItem] = useState({ categoryId: '', categoryName: '', itemName: '', price: '', imageUrl: '', description: '' });
  const [isOwner, setIsOwner] = useState(false);
  const [tables, setTables] = useState([]);
  const [newTable, setNewTable] = useState({ table_number: '', capacity: '' });
  const [categoryError, setCategoryError] = useState('');
  const [categorySuccess, setCategorySuccess] = useState(''); // Define success message state
  const [ItemError, setItemError] = useState('');
  const [ItemSuccess, setItemSuccess] = useState('');


  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/restaurant/menu', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data.categories);
        setIsOwner(response.data.role === 'owner'); // Check if the user is the owner
      } catch (error) {
        console.log('Error fetching menu:', error);
      }
    };

    const fetchTables = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/restaurant/gettables', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTables(response.data.tables);
      } catch (error) {
        console.log('Error fetching tables:', error);
      }
    };

    fetchMenu();
    fetchTables();
  }, []);

  // Handle adding a new category (Owner only)
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/user/restaurant/category', {
        category_name: newCategory,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === 'Success') {
        setCategories([...categories, response.data.category]);
        setNewCategory('');
        setCategoryError('');
        setCategorySuccess('Category added successfully!');
      } else {
        setCategoryError('Unexpected response from server.');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.data.message === 'Category already exists') {
          setCategoryError('Category already exists! Please try a different name.');
        } else {
          setCategoryError(error.response.data.message || 'Error adding category. Please try again later.');
        }
      } else {
        setCategoryError('Error adding category. Please try again later.');
      }
    }
  };
  
// Adding category_name
// 
  // Handle adding a new menu item (Owner only)
  const handleAddItem = async (categoryId) => {
    if (!newItem.categoryName || !newItem.itemName || !newItem.price || !newItem.imageUrl) {
      // You can also add client-side validation error messages here if needed
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('category_id', categoryId);
      formData.append('category_name', newItem.categoryName); 
      formData.append('item_name', newItem.itemName);
      formData.append('price', newItem.price);
      formData.append('description', newItem.description);
      formData.append('image_url', newItem.imageUrl);

  
      const response = await axios.post(
        'http://localhost:8000/api/user/restaurant/menu',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      if (response.data.status === 'Success') {
        const updatedCategories = categories.map((cat) => {
          if (cat._id === categoryId) {
            return { ...cat, items: [...cat.items, response.data.item] };
          }
          return cat;
        });
  
        setCategories(updatedCategories);
        setNewItem({ categoryName: '', itemName: '', price: '', imageUrl: '', description: '' }); // Clear inputs
        // Clear any previous error messages
        setItemError('');
        setItemSuccess('Item added successfully!');
      } else {
        setItemError('Unexpected response from server.');
      }
    } catch (error) {
      // Handle backend error messages
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message;
  
        if (errorMessage === 'Category not found') {
          setItemError('Category not found. Please make sure the category exists.');
        } else if (errorMessage === 'Menu item already exists in this category') {
          setItemError('Menu item already exists. Please use a different name.');
        } else {
          setItemError(errorMessage || 'Error adding item. Please try again later.');
        }
      } else {
        setItemError('Error adding item. Please try again later.');
      }
  
      // Optionally, you can also clear success messages
      setCategorySuccess('');
    }
  };
  
  

  // Handle deleting a menu item (Owner only)
  const handleDeleteItem = async (itemId, categoryId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/restaurant/menu/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the item from the UI
      const updatedCategories = categories.map((cat) => {
        if (cat._id === categoryId) {
          return { ...cat, items: cat.items.filter((item) => item._id !== itemId) };
        }
        return cat;
      });

      setCategories(updatedCategories);
    } catch (error) {
      console.log('Error deleting item:', error);
    }
  };

  // Handle adding a new table
  const handleAddTable = async () => {
    if (!newTable.table_number || !newTable.capacity) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/restaurant/table', {
        table_number: newTable.table_number,
        capacity: newTable.capacity,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTables([...tables, response.data.table]);
      setNewTable({ table_number: '', capacity: '' });
    } catch (error) {
      console.log('Error adding table:', error);
    }
  };

  return (
    <div className={style.menuContainer}>
      <h2>Create Menu</h2>
      <div className='d-flex gap-5'>
        <div className={style.addTableContainer}>
        {categorySuccess && <p className={style.successMessage}>{categorySuccess}</p>}
        {categoryError && <p className={style.errorMessage}>{categoryError}</p>}
          <h2>Category</h2>
          <div className="mb-2">
            <label htmlFor="category_name" className="form-label">Category Name</label>
            <input 
              type="text" 
              className="form-control" 
              id="category_name" 
              placeholder="Category Name" 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </div>
          
          <button onClick={handleAddCategory} className={style.addButton}>Add Category</button>
        </div>

        <div className={style.addTableContainer}>
        {ItemSuccess && <p className={style.successMessage}>{ItemSuccess}</p>}
        {ItemError && <p className={style.errorMessage}>{ItemError}</p>}
          <h2>Item</h2>
          <div className="mb-2">
            <label htmlFor="category_name" className="form-label">Category Name</label>
            <input 
              type="text" 
              className="form-control" 
              id="category_name_item" 
              placeholder="Category Name" 
              value={newItem.categoryName}
              onChange={(e) => setNewItem({ ...newItem, categoryName: e.target.value })}
            />
          </div>
          <div className="mb-2">
            <label htmlFor="item_name" className="form-label">Item Name</label>
            <input 
              type="text" 
              className="form-control" 
              id="item_name" 
              placeholder="Item Name" 
              value={newItem.itemName}
              onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
            />
          </div>
          <div className="mb-2">
            <label htmlFor="description" className="form-label">Item Description</label>
            <textarea 
              className="form-control" 
              id="description" 
              rows="3" 
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
          </div>
          <div className="mb-2">
            <label htmlFor="item_price" className="form-label">Price</label>
            <input 
              type="text" 
              className="form-control" 
              id="item_price" 
              placeholder="Price" 
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            />
          </div>
          <div className="mb-2">
            <label htmlFor="image" className="form-label">Image</label>
            <input 
              type="file" 
              className="form-control" 
              id="image" 
              onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.files[0] })}
            />
          </div>
           <button onClick={() => handleAddItem(newItem.categoryId, categories.find(cat => cat._id === newItem.categoryId)?.category_name)} className={style.addButton}>Add Item</button>        </div>
          </div>

      <ul className={style.tableList}>
        {tables.map((table) => (
          <li key={table._id} className={style.tableItem}>
            <p>Table {table.table_number} - Capacity: {table.capacity}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MenuSection;
