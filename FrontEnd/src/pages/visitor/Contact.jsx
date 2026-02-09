import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';

import { useGlobalContext } from "../../context/GlobalContext";

const Contact = () => {
  const { api, BACKEND_URL, loadingIMG} = useGlobalContext();

  // Color Palette Constants for easy reference in classes
  const colors = {
    blue: "#CDE7FE",
    yellow: "#FEEF75",
    lime: "#D9F17F",
    matBlack: "#121212"
  };


  // Inject Font Awesome & Toast Styles
  useEffect(() => {
    const linkFA = document.createElement("link");
    linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    linkFA.rel = "stylesheet";
    document.head.appendChild(linkFA);

    const linkToast = document.createElement("link");
    linkToast.href = "https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.3/ReactToastify.min.css";
    linkToast.rel = "stylesheet";
    document.head.appendChild(linkToast);

    return () => {
      document.head.removeChild(linkFA);
      document.head.removeChild(linkToast);
    };
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: `[Subject: ${formData.subject}] ${formData.message}`
    };

    try {
      const isPreview = false; 

      if (!isPreview) {
          const res = await fetch(`${BACKEND_URL}/api/inquiries`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || "Failed to send message");
          }
      } else {
          await new Promise(resolve => setTimeout(resolve, 1500));
      }

      toast.success('Message sent! We will contact you soon.');
      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });

    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // FAQ Toggle State
  const [openFaq, setOpenFaq] = useState(null);
  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="w-full font-sans pb-20 bg-gray-50/50  mt-20">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* 1. HERO SECTION */}
      <section className="relative bg-[#121212] text-white p-4 px-6  mb-16 overflow-hidden shadow-2xl">
         {/* Decorative Blobs */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D9F17F] rounded-full filter blur-[140px] opacity-10 translate-x-1/3 -translate-y-1/3"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#CDE7FE] rounded-full filter blur-[120px] opacity-10 -translate-x-1/3 translate-y-1/3"></div>
         
         <div className="relative z-10 text-center max-w-3xl mx-auto">
            <span className="bg-[#D9F17F] text-[#121212] px-4 py-1.5 rounded-full font-bold text-xs tracking-[0.2em] uppercase mb-8 inline-block shadow-lg shadow-[#D9F17F]/20">
               Contact Support
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
               Build Your <br/> <span className="text-[#FEEF75]">Best Self</span> With Us
            </h1>
            <p className="text-gray-400 mb-10 text-xl max-w-xl mx-auto font-medium">
               Whether you're a beginner or a pro, our team is here to support your fitness evolution.
            </p>
         </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 -mt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 pt-20">
         
         {/* 2. CONTACT INFO & MAP (Left Column) */}
         <div className="lg:col-span-5 space-y-8 order-2 lg:order-1">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
               <h3 className="text-3xl font-black text-[#121212] mb-8">Reach Out</h3>
               <div className="space-y-10">
                  <div className="flex items-start gap-6 group">
                     <div className="w-14 h-14 bg-[#CDE7FE] rounded-2xl flex items-center justify-center text-[#121212] text-2xl shrink-0 transition-transform group-hover:scale-110 duration-300">
                        <i className="fa-solid fa-location-dot"></i>
                     </div>
                     <div>
                        <h4 className="font-extrabold text-[#121212] text-lg uppercase tracking-wide">Main Studio</h4>
                        <p className="text-gray-500 mt-2 leading-relaxed font-medium">
                           B-409,410 Shivalik Yash Complex,<br/> 
                           Shastrinagar, Ahmedabad - 380013
                        </p>
                     </div>
                  </div>

                  <div className="flex items-start gap-6 group">
                     <div className="w-14 h-14 bg-[#FEEF75] rounded-2xl flex items-center justify-center text-[#121212] text-2xl shrink-0 transition-transform group-hover:scale-110 duration-300">
                        <i className="fa-solid fa-phone"></i>
                     </div>
                     <div>
                        <h4 className="font-extrabold text-[#121212] text-lg uppercase tracking-wide">Hotline</h4>
                        <p className="text-gray-500 mt-2 font-medium">+91 98765 43210</p>
                        <p className="text-gray-500 font-medium">+91 79 2748 3920</p>
                     </div>
                  </div>

                  <div className="flex items-start gap-6 group">
                     <div className="w-14 h-14 bg-[#D9F17F] rounded-2xl flex items-center justify-center text-[#121212] text-2xl shrink-0 transition-transform group-hover:scale-110 duration-300">
                        <i className="fa-solid fa-envelope"></i>
                     </div>
                     <div>
                        <h4 className="font-extrabold text-[#121212] text-lg uppercase tracking-wide">Electronic Mail</h4>
                        <p className="text-gray-500 mt-2 font-medium">info@songarsgym.com</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Map Embed with Custom Border */}
            <div className="w-full h-90 bg-[#121212] p-1 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
               <div className="w-full h-full rounded-[2.2rem] overflow-hidden">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.187893043232!2d72.5539783150493!3d23.05353498493724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848aba5bd449%3A0x4fcedd11614f6516!2sShastrinagar%20BRTS%20Bus%20Stand!5e0!3m2!1sen!2sin!4v1677654321098!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{border:0}} 
                    allowFullScreen="" 
                    loading="lazy"
                    title="Gym Location"
                    className="grayscale hover:grayscale-0 transition-all duration-700 opacity-80 hover:opacity-100"
                ></iframe>
               </div>
            </div>
         </div>

         {/* 3. CONTACT FORM (Right Column) */}
         <div className="lg:col-span-7 bg-white p-10 md:p-14 rounded-[3rem] border border-gray-100 shadow-2xl order-1 lg:order-2">
            <div className="mb-10">
                <h3 className="text-3xl font-black text-[#121212] mb-3">Send a Message</h3>
                <div className="h-1.5 w-20 bg-[#D9F17F] rounded-full"></div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-xs font-black text-[#121212] uppercase tracking-widest mb-3">Full Name</label>
                     <input 
                        type="text" 
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:outline-none focus:border-[#CDE7FE] focus:bg-white transition-all text-sm"
                        placeholder="e.g. Alex Johnson"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-black text-[#121212] uppercase tracking-widest mb-3">Phone Number</label>
                     <input 
                        type="tel" 
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:outline-none focus:border-[#CDE7FE] focus:bg-white transition-all text-sm"
                        placeholder="+91 00000 00000"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-black text-[#121212] uppercase tracking-widest mb-3">Email Address</label>
                  <input 
                     type="email" 
                     name="email"
                     required
                     value={formData.email}
                     onChange={handleChange}
                     className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:outline-none focus:border-[#CDE7FE] focus:bg-white transition-all text-sm"
                     placeholder="alex@gym.com"
                  />
               </div>

               <div>
                  <label className="block text-xs font-black text-[#121212] uppercase tracking-widest mb-3">What are you looking for?</label>
                  <select 
                     name="subject"
                     value={formData.subject}
                     onChange={handleChange}
                     className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50  focus:outline-none focus:border-[#CDE7FE] focus:bg-white transition-all bg-white text-sm font-medium"
                  >
                     <option>General Inquiry</option>
                     <option>Membership Plans</option>
                     <option>Personal Training</option>
                     <option>Feedback / Complaint</option>
                  </select>
               </div>

               <div>
                  <label className="block text-xs font-black text-[#121212] uppercase tracking-widest mb-3">Your Message</label>
                  <textarea 
                     name="message"
                     required
                     rows="5"
                     value={formData.message}
                     onChange={handleChange}
                     className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:outline-none focus:border-[#CDE7FE] focus:bg-white transition-all resize-none text-sm"
                     placeholder="Write your query here..."
                  ></textarea>
               </div>

               <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-[#121212] text-white rounded-2xl font-black text-lg hover:bg-[#D9F17F] hover:text-[#121212] transition-all duration-300 shadow-xl flex justify-center items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  {isSubmitting ? (
                     <>
                        <i className="fa-solid fa-circle-notch fa-spin"></i> Processing...
                     </>
                  ) : (
                     <>
                        Send Message <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                     </>
                  )}
               </button>
            </form>
         </div>
      </div>

      {/* 4. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-6">
         <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-[#121212] tracking-tight">Got Questions?</h2>
            <p className="text-gray-500 mt-3 font-medium text-lg">We have answers for you.</p>
         </div>

         <div className="space-y-4">
            {[
              { q: "What are your opening hours?", a: "We are open Monday to Saturday from 6:00 AM to 10:00 PM." },
              { q: "Is personal training included in the membership?", a: "General trainer guidance is included. Dedicated 1-on-1 Personal Training packages are available as an add-on." },
              { q: "Is there parking available?", a: "Yes, the complex has ample parking space for both two-wheelers and four-wheelers." },
            ].map((faq, idx) => (
              <div key={idx} className={`bg-white rounded-3xl border-2 transition-all duration-300 ${openFaq === idx ? 'border-[#CDE7FE] shadow-lg' : 'border-gray-50 shadow-sm'}`}>
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center px-8 py-6 text-left focus:outline-none"
                >
                  <span className={`font-black text-lg transition-colors duration-300 ${openFaq === idx ? 'text-[#121212]' : 'text-gray-700'}`}>{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openFaq === idx ? 'bg-[#121212] text-white rotate-180' : 'bg-gray-100 text-gray-400'}`}>
                    <i className="fa-solid fa-chevron-down text-xs"></i>
                  </div>
                </button>
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${openFaq === idx ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-8 pb-8 text-[15px] text-gray-500 font-medium leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
         </div>
      </section>

    </div>
  );
};

export default Contact;