import React from 'react'
import { Outlet } from 'react-router-dom';
import Nav from '../../components/visitor/Nav';

const VisitorLayout = () => {
  return (
    <>
      
      <main className="min-h-screen">
        <Nav/>
      
        <Outlet /> 
      </main>
      
    </>
  );
}

export default VisitorLayout