import { useState, ChangeEvent, FormEvent } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaPaperPlane,
} from "react-icons/fa";
import {
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdAccessTime,
  MdBusiness,
} from "react-icons/md";
import { useContactMutation } from "../redux/api/apiSlice";
import { toast } from "react-toastify";
import "./Contact.css";

// Form data interface
interface FormData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  serviceType: string;
  projectDetails: string;
}

const Contact = () => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    serviceType: '',
    projectDetails: ''
  });

  const [contact, { isLoading }] = useContactMutation();

  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      await contact(formData).unwrap();
      toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        serviceType: '',
        projectDetails: ''
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again or contact us directly.');
    }
  };

  const contactInfo = [
    {
      icon: <MdLocationOn className="text-3xl" />,
      title: "Our Location",
      details: "Meskel flower back side tolip Olympia hotel",
      description:
        "Visit our printing facility at Meskel flower back side tolip Olympia hotel",
    },
    {
      icon: <MdPhone className="text-3xl" />,
      title: "Phone Numbers",
      details: "+251 911-14-37-52, +251 903-42-81-83, +251 922-87-36-41",
      description: "Call us for immediate assistance and quotes",
    },
    {
      icon: <MdEmail className="text-3xl" />,
      title: "Email Address",
      details: "ianprint2014@gmail.com",
      description: "Send us your project details and requirements",
    },
    {
      icon: <MdAccessTime className="text-3xl" />,
      title: "Telegram",
      details: "@ianprintplc",
      description: "Contact us on Telegram for quick responses",
    },
  ];

  const socialLinks = [
    {
      icon: <FaPaperPlane className="text-2xl" />,
      name: "Telegram",
      href: "https://t.me/ianprintplc",
      color: "bg-blue-500",
    },
    {
      icon: <FaWhatsapp className="text-2xl" />,
      name: "WhatsApp",
      href: "#",
      color: "bg-green-500",
    },
    {
      icon: <FaFacebook className="text-2xl" />,
      name: "Facebook",
      href: "#",
      color: "bg-blue-600",
    },
    {
      icon: <FaInstagram className="text-2xl" />,
      name: "Instagram",
      href: "#",
      color: "bg-pink-500",
    },
    {
      icon: <FaTwitter className="text-2xl" />,
      name: "Twitter",
      href: "#",
      color: "bg-blue-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="about-hero-section text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-6">
              Get In Touch
            </span>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Let's <span className="text-pink-400">Connect</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto font-semibold">
              Ready to start your printing project? We're here to help bring
              your vision to life
            </p>
            <div className="flex justify-center space-x-8 text-center">
              <div className="flex flex-col items-center">
                <MdBusiness className="text-4xl text-pink-400 mb-2" />
                <span className="text-lg font-semibold">
                  Expert Consultation
                </span>
              </div>
              <div className="flex flex-col items-center">
                <FaPhone className="text-4xl text-pink-400 mb-2" />
                <span className="text-lg font-semibold">24/7 Support</span>
              </div>
              <div className="flex flex-col items-center">
                <FaEnvelope className="text-4xl text-pink-400 mb-2" />
                <span className="text-lg font-semibold">Quick Response</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="contact-section-title font-semibold text-lg uppercase tracking-wide">
              Contact Information
            </span>
            <h2 className="contact-section-heading text-4xl font-bold mt-4 mb-6">
              Multiple Ways to <span className="text-pink-500">Reach Us</span>
            </h2>
            <p className="contact-section-text text-xl max-w-3xl mx-auto">
              Choose the most convenient way to get in touch with our team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <div key={index} className="contact-info-card p-8 text-center">
                <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="text-pink-500">{info.icon}</div>
                </div>
                <h3 className="contact-section-heading text-xl font-bold mb-3">
                  {info.title}
                </h3>
                <p className="contact-section-text font-semibold mb-2">
                  {info.details}
                </p>
                <p className="contact-section-text text-sm">
                  {info.description}
                </p>
              </div>
            ))}
          </div>

          {/* Social Media Links */}
          <div className="text-center">
            <h3 className="contact-section-heading text-2xl font-bold mb-6">
              Follow Us on Social Media
            </h3>
            <div className="flex justify-center space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`${social.color} text-white p-4 rounded-full hover:scale-110 transition-transform duration-300`}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <span className="contact-section-title font-semibold text-lg uppercase tracking-wide">
                Send Message
              </span>
              <h2 className="contact-section-heading text-4xl font-bold mt-4 mb-6">
                Ready to Start Your{" "}
                <span className="text-pink-500">Project</span>?
              </h2>
              <p className="contact-section-text text-xl max-w-3xl mx-auto">
                Fill out the form below and we'll get back to you within 24
                hours
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="contact-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="contact-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="contact-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="contact-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your company name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Type
                  </label>
                  <select 
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="contact-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Select a service</option>
                    <option value="business-cards">Business Cards</option>
                    <option value="banner-printing">Banner Printing</option>
                    <option value="dtf-film-cutting">DTF Film Cutting</option>
                    <option value="digital-printing">Digital Printing</option>
                    <option value="large-format">Large Format</option>
                    <option value="design-services">Design Services</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Details *
                  </label>
                  <textarea
                    name="projectDetails"
                    value={formData.projectDetails}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="contact-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Tell us about your project, requirements, timeline, and any specific details..."
                  ></textarea>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`contact-submit-button px-12 py-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold text-lg rounded-lg hover:from-pink-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="contact-section-title font-semibold text-lg uppercase tracking-wide">
              Find Us
            </span>
            <h2 className="contact-section-heading text-4xl font-bold mt-4 mb-6">
              Visit Our <span className="text-pink-500">Location</span>
            </h2>
            <p className="contact-section-text text-xl max-w-3xl mx-auto">
              Come see our state-of-the-art printing facility in person
            </p>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
            <div className="h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.5!2d38.7!3d9.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMDAnMDAuMCJOIDM4wrA0MicwMC4wIkU!5e0!3m2!1sen!2set!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="IAN PRINT PLC Location - Meskel flower back side tolip Olympia hotel"
                className="w-full h-full"
              ></iframe>
            </div>
            <div className="p-6 bg-gradient-to-r from-pink-50 to-orange-50">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  IAN PRINT PLC
                </h3>
                <p className="text-lg text-gray-600 mb-4">
                  Meskel flower back side tolip Olympia hotel, Addis Ababa, Ethiopia
                </p>
                <div className="bg-white px-6 py-3 rounded-lg shadow-md inline-block">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Hours:</span> Mon-Fri 8:00
                    AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="about-cta-bg py-20 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your{" "}
            <span className="text-white">Printing Project</span>?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let our expert team help you bring your vision to life with
            professional printing solutions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="about-cta-button px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-300">
              Get Free Quote
            </button>
            <button className="about-cta-button-outline px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-300">
              Call Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
