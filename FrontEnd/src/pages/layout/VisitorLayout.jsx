import React from 'react'
import { Outlet } from 'react-router-dom';
import Nav from '../../components/visitor/Nav';
import Footer from '../../components/visitor/Footer';

const VisitorLayout = () => {
  return (
    <>
      
      <main className="min-h-screen">
        <Nav/>
        <Outlet /> 
        <Footer/>
      </main>
      
    </>
  );
}

export default VisitorLayout