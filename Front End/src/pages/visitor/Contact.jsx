import React from 'react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 px-6 py-16">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Get in Touch</h1>
        <p className="text-lg text-gray-600">
          We'd love to hear from you! Whether you have questions, feedback, or want to join, drop us a message.
        </p>
      </div>

      {/* Contact Form + Info */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
        {/* Contact Form */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Send Us a Message</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Your Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                rows="5"
                placeholder="Write your message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Details */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Contact Details</h2>
          <ul className="space-y-4 text-gray-700">
            <li>
              📞 <strong>Phone:</strong> <a href="tel:+919724370580" className="text-red-600 hover:underline">+91 97243 70580</a>
            </li>
            <li>
              ✉️ <strong>Email:</strong> <a href="mailto:songarsgym@gmail.com" className="text-red-600 hover:underline">songarsgym@gmail.com</a>
            </li>
            <li>
              📍 <strong>Address:</strong><br />
              B-409, 410 Shivalik Yash Complex,<br />
              Shastrinagar Cross Road, 132 Feet Ring Rd,<br />
              Naranpura, Ahmedabad, Gujarat 380013
            </li>
          </ul>

          {/* Google Map Embed (optional) */}
          <div className="mt-6">
            <iframe
              title="Gym Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3670.130257059379!2d72.53671901506358!3d23.091467484908446!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f50adbdc9f%3A0x65b4dd7e0b5f3f2c!2sShivalik%20Yash%20Complex!5e0!3m2!1sen!2sin!4v1693564475486!5m2!1sen!2sin"
              width="100%"
              height="250"
              allowFullScreen=""
              loading="lazy"
              className="rounded-lg border mt-4"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
