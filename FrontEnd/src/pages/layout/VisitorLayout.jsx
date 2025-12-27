import React from 'react'
import { Outlet } from 'react-router-dom';
import Nav from '../../components/visitor/Nav';

const VisitorLayout = () => {
  return (
    <>
      
      <main className="min-h-screen p-4">
        <Nav/>
        <Outlet /> {/* nested visitor pages render here */}
      </main>
      
    </>
  );
}

export default VisitorLayout