import React, { useState, useEffect } from 'react';

const Contact = () => {
  // Inject Font Awesome
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
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
  const [formStatus, setFormStatus] = useState('idle'); // idle, submitting, success

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    // Simulate API call
    setTimeout(() => {
      setFormStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
      setTimeout(() => setFormStatus('idle'), 3000);
    }, 1500);
  };

  // FAQ Toggle State
  const [openFaq, setOpenFaq] = useState(null);
  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  return (
    <div className="font-sans text-gray-800 bg-white pt-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gray-900 py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FEEF75] rounded-full filter blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#CDE7FE] rounded-full filter blur-[100px] opacity-10 -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#CDE7FE] text-blue-900 text-xs font-bold uppercase tracking-wider mb-4">
            We're Here For You
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Get in <span className="text-[#FEEF75]">Touch</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Have questions about memberships, training, or facilities? Drop us a message or visit us today.
          </p>
        </div>
      </section>

      {/* 2. CONTACT INFO CARDS */}
      <section className="py-16 -mt-10 relative z-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Call Us", info: "+91 97243 70580", icon: "fa-phone", bg: "bg-blue-50", text: "text-blue-600", border: "hover:border-blue-200" },
              { title: "Email Us", info: "songarsgym@gmail.com", icon: "fa-envelope", bg: "bg-yellow-50", text: "text-yellow-600", border: "hover:border-yellow-200" },
              { title: "Visit Us", info: "Naranpura, Ahmedabad", icon: "fa-location-dot", bg: "bg-green-50", text: "text-green-600", border: "hover:border-green-200" },
              { title: "Open Hours", info: "Mon-Sat: 6am - 10pm", icon: "fa-clock", bg: "bg-purple-50", text: "text-purple-600", border: "hover:border-purple-200" },
            ].map((item, idx) => (
              <div key={idx} className={`bg-white p-6 rounded-[2rem] shadow-lg border border-transparent ${item.border} transition-all duration-300 hover:-translate-y-1`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4 ${item.bg} ${item.text}`}>
                  <i className={`fa-solid ${item.icon}`}></i>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 font-medium">{item.info}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FORM & MAP SECTION */}
      <section className="py-10 pb-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Contact Form */}
            <div className="lg:w-1/2">
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
                <h2 className="text-3xl font-black text-gray-900 mb-2">Send a Message</h2>
                <p className="text-gray-500 mb-8">We usually respond within 24 hours.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Name</label>
                      <input 
                        type="text" 
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#CDE7FE] focus:ring-4 focus:ring-[#CDE7FE]/20 transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Phone</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#CDE7FE] focus:ring-4 focus:ring-[#CDE7FE]/20 transition-all"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#CDE7FE] focus:ring-4 focus:ring-[#CDE7FE]/20 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Subject</label>
                    <select 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#CDE7FE] focus:ring-4 focus:ring-[#CDE7FE]/20 transition-all cursor-pointer"
                    >
                      <option>General Inquiry</option>
                      <option>Membership Plans</option>
                      <option>Personal Training</option>
                      <option>Career / Job</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Message</label>
                    <textarea 
                      name="message"
                      required
                      rows="4"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#CDE7FE] focus:ring-4 focus:ring-[#CDE7FE]/20 transition-all resize-none"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={formStatus === 'submitting'}
                    className={`w-full py-4 rounded-xl font-bold text-sm shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2
                      ${formStatus === 'success' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                  >
                    {formStatus === 'submitting' ? (
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                    ) : formStatus === 'success' ? (
                      <>Message Sent <i className="fa-solid fa-check"></i></>
                    ) : (
                      <>Send Message <i className="fa-regular fa-paper-plane"></i></>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Map & Info */}
            <div className="lg:w-1/2 flex flex-col">
              <div className="bg-gray-100 rounded-[2.5rem] overflow-hidden shadow-inner h-[400px] lg:h-full relative mb-8 border border-gray-200">
                <iframe
                  title="Gym Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3670.130257059379!2d72.53671901506358!3d23.091467484908446!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f50adbdc9f%3A0x65b4dd7e0b5f3f2c!2sShivalik%20Yash%20Complex!5e0!3m2!1sen!2sin!4v1693564475486!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  allowFullScreen=""
                  loading="lazy"
                  className="filter grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                ></iframe>
                
                {/* Floating Address Card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/50">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <i className="fa-solid fa-location-dot text-red-500"></i> Songar's Gym
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 pl-6">
                    B-409, 410 Shivalik Yash Complex, 132 Feet Ring Rd, Naranpura, Ahmedabad.
                  </p>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-4 justify-center lg:justify-start">
                {['instagram', 'facebook', 'twitter', 'whatsapp'].map(social => (
                  <button key={social} className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-900 transition-all shadow-sm">
                    <i className={`fa-brands fa-${social} text-lg`}></i>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="py-20 bg-[#f8fbff]">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Common Questions</h2>
            <p className="text-gray-500">Quick answers to help you get started.</p>
          </div>

          <div className="space-y-4">
            {[
              { q: "Do you offer a free trial?", a: "Yes! We offer a 1-day free trial session for all new visitors. You can book it directly from our website." },
              { q: "What are your operating hours?", a: "We are open Monday to Saturday from 6:00 AM to 10:00 PM. On Sundays, we are open from 8:00 AM to 12:00 PM." },
              { q: "Is personal training included in the membership?", a: "General trainer guidance is included. Dedicated 1-on-1 Personal Training packages are available as an add-on." },
              { q: "Is there parking available?", a: "Yes, the complex has ample parking space for both two-wheelers and four-wheelers." },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center p-5 text-left focus:outline-none hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-800">{faq.q}</span>
                  <i className={`fa-solid fa-chevron-down text-gray-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`}></i>
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-5 pt-0 text-sm text-gray-500 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Contact;