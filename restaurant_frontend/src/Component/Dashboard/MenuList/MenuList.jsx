import React, { useEffect, useState } from 'react';
import axios from 'axios';
import style from './MenuList.module.css';

function MenuList() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/user/restaurant/menulist', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('API Response:', response.data);
        if (response.data && response.data.categories) {
          setMenu(response.data.categories);
        }
      } catch (err) {
        console.error('API Error:', err);
        setError('Failed to fetch menu');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []); // No need to include `menu` in the dependency array

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={style.tableWrapper}>
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">SL No</th>
            <th scope="col">Item Name</th>
            <th scope="col">Item Description</th>
            <th scope="col">Item Price</th>
            <th scope="col">Category Name</th> {/* Changed header to 'Category Name' */}
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {menu.map((item, index) => (
            <tr key={index}> {/* Removed 'item.id' assuming no unique id is present */}
              <td>{index + 1}</td>
              <td>{item.item_name}</td>
              <td>{item.description}</td>
              <td>${item.price}</td>
              <td>{item.category_name}</td> {/* Displaying the category_name */}
              <td>
                <button className='btn btn-success'>Edit</button>
                <button className='btn btn-danger ms-2'>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MenuList;
