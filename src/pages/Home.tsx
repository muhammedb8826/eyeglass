import { Link } from "react-router-dom";
import { FaPrint, FaCut, FaShieldAlt, FaAward, FaStar } from "react-icons/fa";
import { MdPrint, MdBusiness, MdSpeed, MdSupport } from "react-icons/md";
import getStartedSideImage from "../assets/images/get-started-side-image.png";
import './Home.css';

export const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="home-hero-section">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="home-hero-content text-center lg:text-left">
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-6">
                Professional Printing Solutions
              </span>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Quality Printing That <span className="text-pink-200">Speaks Volumes</span>
            </h1>
              <p className="text-xl lg:text-2xl mb-4 leading-relaxed max-w-2xl">
              IAN PRINT PLC is a modern and innovative printing company in Ethiopia, dedicated to delivering high-quality printing solutions that meet the diverse needs of businesses and individuals.
            </p>
              <p className="text-2xl lg:text-3xl mb-8 font-bold text-pink-200">
                Making You Visible
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/contact" className="home-cta-button px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 text-center">
                  Get Free Quote
                </Link>
                <Link to="/services" className="home-cta-button-outline px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 text-center">
                  View Services
            </Link>
          </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <img 
                  src={getStartedSideImage} 
                  alt="Modern Printing Facility" 
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl">
                <div className="text-center">
                  <div className="home-stats-number text-3xl font-bold">2021</div>
                  <div className="home-section-text text-sm">Established</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Services Highlights */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="home-section-title font-semibold text-lg uppercase tracking-wide">Our Services</span>
            <h2 className="home-section-heading text-4xl font-bold mt-4 mb-6">
              Comprehensive <span className="text-pink-500">Printing Solutions</span>
            </h2>
            <p className="home-section-text text-xl max-w-3xl mx-auto">
              We offer a complete range of professional printing services including Rollups, Sticker Print, Light Box, DTF Print, Car Branding, Neon Light, Plotter, Banner Print, Giveaway Materials, Different Signage, UV Print, Engrave, Flag Print, and Sublimation.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {[
              { name: "Rollups", icon: <FaPrint className="text-3xl" /> },
              { name: "Sticker Print", icon: <FaPrint className="text-3xl" /> },
              { name: "Light Box", icon: <FaPrint className="text-3xl" /> },
              { name: "DTF Print", icon: <FaCut className="text-3xl" /> },
              { name: "Car Branding", icon: <MdBusiness className="text-3xl" /> },
              { name: "Neon Light", icon: <FaPrint className="text-3xl" /> },
              { name: "Plotter", icon: <MdPrint className="text-3xl" /> },
              { name: "Banner Print", icon: <MdPrint className="text-3xl" /> },
              { name: "Giveaway Materials", icon: <FaPrint className="text-3xl" /> },
              { name: "Signage", icon: <MdBusiness className="text-3xl" /> },
              { name: "UV Print", icon: <FaPrint className="text-3xl" /> },
              { name: "Engrave", icon: <FaCut className="text-3xl" /> },
              { name: "Flag Print", icon: <FaPrint className="text-3xl" /> },
              { name: "Sublimation", icon: <FaPrint className="text-3xl" /> }
            ].map((service, index) => (
              <div key={index} className="home-service-card p-6 text-center">
                <div className="home-service-icon mx-auto mb-3">
                  {service.icon}
                </div>
                <h3 className="home-section-heading text-sm font-bold">{service.name}</h3>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a 
              href="/services" 
              className="home-cta-button inline-block px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300"
            >
              View All Services
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="home-section-title font-semibold text-lg uppercase tracking-wide">Why Choose Us</span>
            <h2 className="home-section-heading text-4xl font-bold mt-4 mb-6">
              The <span className="text-pink-500">IAN PRINT</span> Advantage
          </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="home-feature-card p-8 text-center">
              <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShieldAlt className="text-3xl text-pink-500" />
                </div>
              <h3 className="home-section-heading text-xl font-bold mb-3">Quality Assurance</h3>
              <p className="home-section-text">
                We prioritize quality in every aspect of our work. From using premium materials to employing advanced printing techniques, we ensure that our clients receive prints of the highest standard.
                </p>
            </div>

            <div className="home-feature-card p-8 text-center">
              <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MdSpeed className="text-3xl text-pink-500" />
              </div>
              <h3 className="home-section-heading text-xl font-bold mb-3">Timely Delivery</h3>
              <p className="home-section-text">
                We understand the importance of meeting deadlines. Our efficient production processes and dedicated team enable us to deliver projects on time without compromising on quality.
              </p>
            </div>

            <div className="home-feature-card p-8 text-center">
              <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MdSupport className="text-3xl text-pink-500" />
          </div>
              <h3 className="home-section-heading text-xl font-bold mb-3">Customer Satisfaction</h3>
              <p className="home-section-text">
                At Ian Print PLC, customer satisfaction is at the core of our business philosophy. We strive to build long-term relationships with our clients by providing exceptional service.
              </p>
                </div>

            <div className="home-feature-card p-8 text-center">
              <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaAward className="text-3xl text-pink-500" />
            </div>
              <h3 className="home-section-heading text-xl font-bold mb-3">Competitive Pricing</h3>
              <p className="home-section-text">
                High-quality services offered at fair and affordable prices. We believe exceptional printing shouldn't break the bank.
              </p>
            </div>

            <div className="home-feature-card p-8 text-center">
              <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShieldAlt className="text-3xl text-pink-500" />
            </div>
              <h3 className="home-section-heading text-xl font-bold mb-3">Proven Experience</h3>
              <p className="home-section-text">
                Trusted by businesses, NGOs, institutions, and individuals across Ethiopia, with a track record of excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Overview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="home-section-title font-semibold text-lg uppercase tracking-wide">About IAN PRINT PLC</span>
              <h2 className="home-section-heading text-4xl font-bold mt-4 mb-6">
                Leading Printing <span className="text-pink-500">Solutions</span> in Ethiopia
              </h2>
              <p className="home-section-text text-lg mb-6 leading-relaxed">
                Ian Print is a private Limited Company established in 2021 G.C with substantial operating capacity & powered by a team of highly professionals with a combined experience of minimum of 4 years in the industry it evolved.
              </p>
              <p className="home-section-text text-lg mb-6 leading-relaxed">
                At Ian Print PLC, we believe that printing is more than just ink on paper; it is about bringing ideas to life, communicating messages effectively, and building strong brands.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <div className="home-stats-number text-3xl font-bold">2021</div>
                  <div className="home-section-text text-sm">Established</div>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <div className="home-stats-number text-3xl font-bold">4+</div>
                  <div className="home-section-text text-sm">Years Experience</div>
                </div>
              </div>
            </div>
            {/* IMAGE PLACEHOLDER: Company Image */}
            <div className="bg-gray-200 rounded-lg shadow-2xl h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MdBusiness className="text-6xl mx-auto mb-4" />
                <p className="text-lg font-semibold">Company Image</p>
                <p className="text-sm">(Team, facility, or printing process)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Served Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="home-section-title font-semibold text-lg uppercase tracking-wide">Industries We Serve</span>
            <h2 className="home-section-heading text-4xl font-bold mt-4 mb-6">
              Trusted by <span className="text-pink-500">Leading Organizations</span>
            </h2>
            <p className="home-section-text text-xl max-w-3xl mx-auto">
              We serve clients across various industries with our comprehensive printing solutions
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <MdBusiness className="text-4xl text-pink-500 mx-auto mb-3" />
              <h3 className="home-section-heading text-lg font-bold mb-2">Corporate</h3>
              <p className="home-section-text text-sm">Businesses & Companies</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <FaAward className="text-4xl text-pink-500 mx-auto mb-3" />
              <h3 className="home-section-heading text-lg font-bold mb-2">Education</h3>
              <p className="home-section-text text-sm">Schools & Universities</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <FaShieldAlt className="text-4xl text-pink-500 mx-auto mb-3" />
              <h3 className="home-section-heading text-lg font-bold mb-2">Hospitality</h3>
              <p className="home-section-text text-sm">Hotels & Restaurants</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <FaAward className="text-4xl text-pink-500 mx-auto mb-3" />
              <h3 className="home-section-heading text-lg font-bold mb-2">NGOs</h3>
              <p className="home-section-text text-sm">Non-Profit Organizations</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <FaShieldAlt className="text-4xl text-pink-500 mx-auto mb-3" />
              <h3 className="home-section-heading text-lg font-bold mb-2">Government</h3>
              <p className="home-section-text text-sm">Government Institutions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Clients Marquee Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="home-section-title font-semibold text-lg uppercase tracking-wide">Trusted By</span>
            <h2 className="home-section-heading text-4xl font-bold mt-4 mb-6">
              Our <span className="text-pink-500">Clients</span>
            </h2>
            <p className="home-section-text text-xl max-w-3xl mx-auto">
              We proudly serve clients across various industries including corporate, education, hospitality, NGOs, and government institutions
            </p>
          </div>

          {/* Scrolling Marquee */}
          <div className="relative overflow-hidden py-8">
            <div className="flex animate-scroll" style={{ width: 'fit-content' }}>
              {/* First set of client logos */}
              {[...Array(10)].map((_, index) => (
                <div 
                  key={`first-${index}`}
                  className="flex-shrink-0 bg-gray-100 rounded-lg p-6 flex items-center justify-center h-32 w-48 mx-6 hover:bg-gray-200 transition-colors duration-300"
                >
                  {/* IMAGE PLACEHOLDER: Client Logo */}
                  <div className="text-center text-gray-400">
                    <MdBusiness className="text-4xl mx-auto mb-2" />
                    <p className="text-xs font-semibold">Client {index + 1}</p>
                  </div>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {[...Array(10)].map((_, index) => (
                <div 
                  key={`second-${index}`}
                  className="flex-shrink-0 bg-gray-100 rounded-lg p-6 flex items-center justify-center h-32 w-48 mx-6 hover:bg-gray-200 transition-colors duration-300"
                >
                  {/* IMAGE PLACEHOLDER: Client Logo */}
                  <div className="text-center text-gray-400">
                    <MdBusiness className="text-4xl mx-auto mb-2" />
                    <p className="text-xs font-semibold">Client {index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">2021</div>
              <div className="text-pink-100 text-lg">Established</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">4+</div>
              <div className="text-pink-100 text-lg">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">500+</div>
              <div className="text-pink-100 text-lg">Projects Completed</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">100+</div>
              <div className="text-pink-100 text-lg">Happy Clients</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="home-section-title font-semibold text-lg uppercase tracking-wide">Testimonials</span>
            <h2 className="home-section-heading text-4xl font-bold mt-4 mb-6">
              What Our <span className="text-pink-500">Clients Say</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="home-testimonial-card p-8">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-lg" />
                ))}
              </div>
              <p className="home-testimonial-text mb-6">
                "IAN PRINT delivered exceptional quality business cards that perfectly represent our brand. The attention to detail and fast turnaround exceeded our expectations."
              </p>
              <div className="home-testimonial-author">- Sarah Johnson, Marketing Director</div>
            </div>

            <div className="home-testimonial-card p-8">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-lg" />
                ))}
              </div>
              <p className="home-testimonial-text mb-6">
                "Their banner printing service is outstanding. The quality is professional and the customer service is top-notch. Highly recommended for any printing needs."
              </p>
              <div className="home-testimonial-author">- Michael Chen, Event Coordinator</div>
            </div>

            <div className="home-testimonial-card p-8">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-lg" />
                ))}
              </div>
              <p className="home-testimonial-text mb-6">
                "Working with IAN PRINT has been a game-changer for our business. Their DTF film cutting precision and quality have helped us deliver better products to our customers."
              </p>
              <div className="home-testimonial-author">- David Rodriguez, Business Owner</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-cta-section py-20 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Start Your <span className="text-white">Printing Project</span>?
        </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Let our expert team help you bring your vision to life with professional printing solutions that make an impact
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="home-cta-button px-8 py-4 rounded-full font-semibold text-lg text-center">
              Get Free Quote
            </Link>
            <Link to="/contact" className="home-cta-button-outline px-8 py-4 rounded-full font-semibold text-lg text-center">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
