import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './Component/Home/Home'
import Signin from './Component/Signin/Signin'
import Signup from './Component/Signup/Signup'
import Aboutus from './Component/About us/Aboutus'
import Contactus from './Component/Contact us/Contactus'
import Ourpartner from './Component/Our partner/Ourpartner'
import Portfolio from './Component/Portfolio/Portfolio'
import Nav from './Component/Nav/Nav'
import Footer from './Component/Footer/Footer'
import Dashboard from './Component/Dashboard/Dashboard'
import Adminprofile from './Component/Dashboard/Profile/Adminprofile'
import VerifyEmail from './Component/VerifyEmail/VerifyEmail'
import MenuSection from './Component/Dashboard/Menu/Menusection'
import MenuList from './Component/Dashboard/MenuList/MenuList'
import MenuPage from './Component/MenuPage/MenuPage'
// import CartPage from './Component/CartPage/CartPage'


import EmployeeSection from './Component/Dashboard/Employee/EmployeeSection'
import OrderSection from './Component/Dashboard/Order/OrderSection'
import GuestCheckout from './Component/GuestCheckout/GuestCheckout';


const App = () => {
  return (
    <div>
      {/* <Nav/> */}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signin' element={<Signin />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/aboutus' element={<Aboutus />} />
        <Route path='/menu' element={<MenuPage />} />
        <Route path='/guest-checkout' element={<GuestCheckout />} />
        <Route path='/contactus' element={<Contactus />} />
        <Route path='/ourpartner' element={<Ourpartner />} />
        <Route path='/portfolio' element={<Portfolio />} />
        <Route path='/dashboard' element={<Dashboard />} >
          <Route path='menu' element={<MenuSection />} />
          <Route path='menu_list' element={<MenuList />} />
          {/* <Route path='/new' element={<New/>}/> */}
          <Route path='employee' element={<EmployeeSection />} />
          <Route path='order' element={<OrderSection />} />
        </Route>
          <Route path='profile' element={<Adminprofile />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

      </Routes>
    </div>
  )
}

export default App