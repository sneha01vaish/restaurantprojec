import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import userIcon from '../Assets/icons/profile.png';
import style from './dashboard.module.css'; // Assuming you have styles set up

const Dashboard = () => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile'); // Navigate to the profile page when the icon is clicked
  };

  return (
    <div className={style.dashboardContainer}>
      <div>
        {/* Sidebar */}
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className={style.mainContent}>
        {/* Profile Icon */}
        <div className={style.profileIcon} onClick={handleProfileClick}>
          <img src={userIcon} alt="Profile" />
          <p>Profile</p>
        </div>

        {/* Routes for different sections */}
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
