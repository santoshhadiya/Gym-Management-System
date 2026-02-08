import React from 'react'
import { Outlet } from 'react-router-dom';
import Nav from '../../components/visitor/Nav';
import Footer from '../../components/visitor/Footer';
import GymChatbot from '../visitor/GymChatbot';

const VisitorLayout = () => {
  return (
    <>
      
      <main className="min-h-screen">
        <Nav/>
        <Outlet /> 
        <GymChatbot/>
        <Footer/>
      </main>
      
    </>
  );
}

export default VisitorLayout