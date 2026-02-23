import { Link } from "react-router-dom";
import { FaPrint, FaPalette, FaCut, FaShieldAlt, FaAward, FaLightbulb, FaCheckCircle, FaClock, FaHeart, FaUsers, FaGlobe } from "react-icons/fa";
import { MdPrint, MdBusiness, MdLocalPrintshop } from "react-icons/md";
import './About.css';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="about-hero-section text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              COMPANY <span className="text-pink-400">PROFILE</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto font-semibold">
              Making You Visible
            </p>
            <div className="flex justify-center space-x-8 text-center">
              <div className="flex flex-col items-center">
                <FaPrint className="text-4xl text-pink-400 mb-2" />
                <span className="text-lg font-semibold">Premium Quality</span>
              </div>
              <div className="flex flex-col items-center">
                <FaPalette className="text-4xl text-pink-400 mb-2" />
                <span className="text-lg font-semibold">Creative Design</span>
              </div>
              <div className="flex flex-col items-center">
                <FaCut className="text-4xl text-pink-400 mb-2" />
                <span className="text-lg font-semibold">Precision Cutting</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Story Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="about-section-title font-semibold text-lg uppercase tracking-wide">Hello There!</span>
              <h2 className="about-section-heading text-4xl font-bold mt-4 mb-6">
                We are <span className="about-accent-text">IAN PRINT PLC</span>
              </h2>
              <p className="about-section-text text-lg mb-6 leading-relaxed">
                IAN PRINT PLC. is a modern and innovative printing company in Ethiopia, dedicated to delivering high-quality printing solutions that meet the diverse needs of businesses and individuals. Established with a strong commitment to excellence, we combine advanced printing technology, skilled craftsmanship, and creative expertise to produce exceptional results across a wide range of printing services.
              </p>
              <p className="about-section-text text-lg mb-8 leading-relaxed">
                <span className="font-bold text-2xl">Making You Visible</span>
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="about-stats-number text-3xl font-bold">2021</div>
                  <div className="about-section-text">Established</div>
                </div>
                <div className="text-center">
                  <div className="about-stats-number text-3xl font-bold">4+</div>
                  <div className="about-section-text">Years Experience</div>
                </div>
              </div>
            </div>
            {/* IMAGE PLACEHOLDER: Company Introduction Image */}
            {/* Place your company introduction/team image here */}
            <div className="relative bg-gray-200 rounded-lg shadow-2xl h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <FaUsers className="text-6xl mx-auto mb-4" />
                <p className="text-lg font-semibold">Company Image</p>
                <p className="text-sm">(Team, facility, or printing process)</p>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="about-stats-number text-2xl font-bold">24/7</div>
                  <div className="about-section-text">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Overview Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="about-section-text text-lg mb-6 leading-relaxed">
                With years of experience and a reputation for reliability, Ian Print PLC is positioned as one of Ethiopia's leading printing companies, serving clients across various industries including corporate, education, hospitality, NGOs, and government institutions.
              </p>
              <p className="about-section-text text-lg mb-6 leading-relaxed">
                Our mission is to empower brands and communities through outstanding printing and design solutions, while our vision is to be recognized as Ethiopia's leading and most innovative printing partner.
              </p>
              <p className="about-section-text text-2xl font-bold text-red-600 mb-8">
                Making You Visible
              </p>
            </div>
            {/* IMAGE PLACEHOLDER: Company Overview Image */}
            {/* Place your company overview image here (showing industries served, printer ink cartridges, etc.) */}
            <div className="relative bg-gray-200 rounded-lg shadow-2xl w-full h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <FaPrint className="text-6xl mx-auto mb-4" />
                <p className="text-lg font-semibold">Company Overview Image</p>
                <p className="text-sm">(Industries served, printer equipment)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission, Vision, and Core Values Section */}
      <div className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="about-section-title font-semibold text-lg uppercase tracking-wide">Our Foundation</span>
            <h2 className="about-section-heading text-4xl font-bold mt-4 mb-6">
              Mission, Vision & <span className="about-accent-text">Core Values</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Mission */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="about-section-heading text-3xl font-bold text-red-600">Mission</h3>
              </div>
              <p className="about-section-text text-lg italic leading-relaxed">
                To deliver world-class printing and branding solutions that combine quality, creativity, and innovation — helping businesses, organizations, and individuals bring their ideas to life and communicate their message effectively.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center mb-6">
                <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <h3 className="about-section-heading text-3xl font-bold text-red-600">Vision</h3>
              </div>
              <p className="about-section-text text-lg italic leading-relaxed">
                To be Ethiopia's most trusted and innovative printing company — a leader in quality, technology, and customer satisfaction — setting new benchmarks in the printing and branding industry.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex items-center mb-6">
              <div className="bg-pink-100 w-16 h-16 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-pink-600">3</span>
              </div>
              <h3 className="about-section-heading text-3xl font-bold text-red-600">Core Values</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center">
                <FaCheckCircle className="text-red-600 mr-3 text-xl" />
                <span className="about-section-text font-semibold">Quality Excellence</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="text-red-600 mr-3 text-xl" />
                <span className="about-section-text font-semibold">Innovation</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="text-red-600 mr-3 text-xl" />
                <span className="about-section-text font-semibold">Customer Focus</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="text-red-600 mr-3 text-xl" />
                <span className="about-section-text font-semibold">Integrity</span>
              </div>
            </div>
          </div>

          {/* IMAGE PLACEHOLDER: Mission, Vision, Core Values Graphic */}
          {/* Place your Mission/Vision/Values graphic image here */}
          <div className="mt-12 text-center">
            <div className="bg-gray-200 rounded-lg shadow-xl mx-auto max-w-4xl h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <FaAward className="text-6xl mx-auto mb-4" />
                <p className="text-lg font-semibold">Mission, Vision & Core Values</p>
                <p className="text-sm">(Full graphic with hexagonal icons)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Services Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="about-section-title font-semibold text-lg uppercase tracking-wide">Our Expertise</span>
            <h2 className="about-section-heading text-4xl font-bold mt-4 mb-6">
              Comprehensive <span className="about-accent-text">Printing Solutions</span>
            </h2>
            <p className="about-section-text text-xl max-w-3xl mx-auto">
              We offer a complete range of professional printing services to meet all your business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Business Cards */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-6">
                <MdBusiness className="about-service-icon text-5xl mx-auto mb-4" />
                <h3 className="about-section-heading text-2xl font-bold mb-2">Business Cards</h3>
              </div>
              <ul className="about-section-text space-y-2">
                <li>• Premium cardstock options</li>
                <li>• UV coating & spot UV</li>
                <li>• Foil stamping & embossing</li>
                <li>• Custom die-cutting</li>
                <li>• Quick turnaround times</li>
              </ul>
            </div>

            {/* Banner Printing */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-6">
                <MdPrint className="about-service-icon text-5xl mx-auto mb-4" />
                <h3 className="about-section-heading text-2xl font-bold mb-2">Banner Printing</h3>
              </div>
              <ul className="about-section-text space-y-2">
                <li>• Large format printing</li>
                <li>• Indoor & outdoor banners</li>
                <li>• High-resolution graphics</li>
                <li>• Weather-resistant materials</li>
                <li>• Custom sizes available</li>
              </ul>
            </div>

            {/* DTF Film Cutting */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-6">
                <FaCut className="about-service-icon text-5xl mx-auto mb-4" />
                <h3 className="about-section-heading text-2xl font-bold mb-2">DTF Film Cutting</h3>
              </div>
              <ul className="about-section-text space-y-2">
                <li>• Direct to Film technology</li>
                <li>• Precision cutting systems</li>
                <li>• Heat transfer applications</li>
                <li>• Custom designs & patterns</li>
                <li>• Professional finish</li>
              </ul>
            </div>

            {/* Digital Printing */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-6">
                <MdLocalPrintshop className="about-service-icon text-5xl mx-auto mb-4" />
                <h3 className="about-section-heading text-2xl font-bold mb-2">Digital Printing</h3>
              </div>
              <ul className="about-section-text space-y-2">
                <li>• High-speed production</li>
                <li>• Variable data printing</li>
                <li>• Short-run printing</li>
                <li>• Color management</li>
                <li>• Quick proofs</li>
              </ul>
            </div>

            {/* Large Format */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-6">
                <FaPrint className="about-service-icon text-5xl mx-auto mb-4" />
                <h3 className="about-section-heading text-2xl font-bold mb-2">Large Format</h3>
              </div>
              <ul className="about-section-text space-y-2">
                <li>• Vehicle wraps & graphics</li>
                <li>• Building signage</li>
                <li>• Trade show displays</li>
                <li>• Wall murals</li>
                <li>• Window graphics</li>
              </ul>
            </div>

            {/* Finishing Services */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-6">
                <FaCut className="about-service-icon text-5xl mx-auto mb-4" />
                <h3 className="about-section-heading text-2xl font-bold mb-2">Finishing Services</h3>
              </div>
              <ul className="about-section-text space-y-2">
                <li>• Lamination & coating</li>
                <li>• Folding & binding</li>
                <li>• Die-cutting & scoring</li>
                <li>• Foil stamping</li>
                <li>• Embossing & debossing</li>
              </ul>
            </div>
          </div>
          </div>
        </div>

      {/* Why Choose Us Section */}
      <div className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="about-section-title font-semibold text-lg uppercase tracking-wide">Why Choose Us</span>
            <h2 className="about-section-heading text-4xl font-bold mt-4 mb-6">
              The <span className="about-accent-text">IAN PRINT</span> Advantage
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <div className="space-y-8">
              {/* Quality Assurance */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="about-section-heading text-2xl font-bold mb-4 text-red-600">Quality Assurance</h3>
                <p className="about-section-text text-lg leading-relaxed">
                  We prioritize quality in every aspect of our work. From using premium materials to employing advanced printing techniques, we ensure that our clients receive prints of the highest standard.
                </p>
              </div>

              {/* Timely Delivery */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="about-section-heading text-2xl font-bold mb-4 text-red-600">Timely Delivery</h3>
                <p className="about-section-text text-lg leading-relaxed">
                  We understand the importance of meeting deadlines. Our efficient production processes and dedicated team enable us to deliver projects on time without compromising on quality.
                </p>
              </div>

              {/* Customer Satisfaction */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="about-section-heading text-2xl font-bold mb-4 text-red-600">Customer Satisfaction</h3>
                <p className="about-section-text text-lg leading-relaxed">
                  At Ian Print PLC, customer satisfaction is at the core of our business philosophy. We strive to build long-term relationships with our clients by providing exceptional service.
                </p>
              </div>

              {/* Competitive Pricing */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="about-section-heading text-2xl font-bold mb-4 text-red-600">Competitive Pricing</h3>
                <p className="about-section-text text-lg leading-relaxed">
                  High-quality services offered at fair and affordable prices. We believe exceptional printing shouldn't break the bank.
                </p>
              </div>

              {/* Proven Experience */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="about-section-heading text-2xl font-bold mb-4 text-red-600">Proven Experience</h3>
                <p className="about-section-text text-lg leading-relaxed">
                  Trusted by businesses, NGOs, institutions, and individuals across Ethiopia, with a track record of excellence.
                </p>
              </div>
            </div>

            {/* IMAGE PLACEHOLDER: Why Choose Us Image */}
            {/* Place your "Why Choose Us" image here (showing company sign, branded cap, etc.) */}
            <div className="relative bg-gray-200 rounded-lg shadow-2xl w-full h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <FaShieldAlt className="text-6xl mx-auto mb-4" />
                <p className="text-lg font-semibold">Why Choose Us Image</p>
                <p className="text-sm">(Company sign, branded cap, advantages)</p>
              </div>
            </div>
          </div>

          {/* Additional Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            <div className="text-center bg-white p-6 rounded-lg shadow-lg">
              <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShieldAlt className="about-service-icon text-3xl text-pink-600" />
              </div>
              <h3 className="about-section-heading text-xl font-bold mb-3">Quality Guaranteed</h3>
              <p className="about-section-text text-sm">
                Every print job meets our strict quality standards
              </p>
            </div>

            <div className="text-center bg-white p-6 rounded-lg shadow-lg">
              <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaClock className="about-service-icon text-3xl text-pink-600" />
              </div>
              <h3 className="about-section-heading text-xl font-bold mb-3">On-Time Delivery</h3>
              <p className="about-section-text text-sm">
                Efficient processes ensure timely project completion
              </p>
            </div>

            <div className="text-center bg-white p-6 rounded-lg shadow-lg">
              <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHeart className="about-service-icon text-3xl text-pink-600" />
              </div>
              <h3 className="about-section-heading text-xl font-bold mb-3">Customer Focus</h3>
              <p className="about-section-text text-sm">
                Building long-term relationships through exceptional service
              </p>
            </div>

            <div className="text-center bg-white p-6 rounded-lg shadow-lg">
              <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaAward className="about-service-icon text-3xl text-pink-600" />
              </div>
              <h3 className="about-section-heading text-xl font-bold mb-3">Industry Leader</h3>
              <p className="about-section-text text-sm">
                Recognized as one of Ethiopia's leading printing companies
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Company Section */}
      <div className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="about-section-title font-semibold text-lg uppercase tracking-wide">About Company</span>
              <h2 className="about-section-heading text-4xl font-bold mt-4 mb-6">
                Our <span className="about-accent-text">Story</span>
              </h2>
              <p className="about-section-text text-lg mb-6 leading-relaxed">
                Ian Print is a private Limited Company established in 2021 G.C with substantial operating capacity & powered by a team of highly professionals with a combined experience of minimum of 4 years in the industry it evolved.
              </p>
              <p className="about-section-text text-lg mb-6 leading-relaxed">
                At Ian Print PLC, we believe that printing is more than just ink on paper; it is about bringing ideas to life, communicating messages effectively, and building strong brands.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaLightbulb className="about-service-icon text-xl mr-3" />
                  <span className="about-section-text">Substantial operating capacity</span>
                </div>
                <div className="flex items-center">
                  <FaLightbulb className="about-service-icon text-xl mr-3" />
                  <span className="about-section-text">Team of highly skilled professionals</span>
                </div>
                <div className="flex items-center">
                  <FaLightbulb className="about-service-icon text-xl mr-3" />
                  <span className="about-section-text">Minimum 4 years combined experience</span>
                </div>
                <div className="flex items-center">
                  <FaLightbulb className="about-service-icon text-xl mr-3" />
                  <span className="about-section-text">Bringing ideas to life through printing</span>
                </div>
              </div>
            </div>
            {/* IMAGE PLACEHOLDER: Printing Equipment Images */}
            {/* Place your printing equipment/technology images here */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-200 rounded-lg shadow-lg h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <FaPrint className="text-4xl mx-auto mb-2" />
                  <p className="text-sm font-semibold">Equipment 1</p>
                </div>
              </div>
              <div className="bg-gray-200 rounded-lg shadow-lg h-64 flex items-center justify-center mt-8">
                <div className="text-center text-gray-500">
                  <FaPrint className="text-4xl mx-auto mb-2" />
                  <p className="text-sm font-semibold">Equipment 2</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Clients Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="about-section-title font-semibold text-lg uppercase tracking-wide">Trusted By</span>
            <h2 className="about-section-heading text-4xl font-bold mt-4 mb-6">
              Our <span className="about-accent-text">Clients</span>
            </h2>
            <p className="about-section-text text-xl max-w-3xl mx-auto">
              We proudly serve clients across various industries including corporate, education, hospitality, NGOs, and government institutions
            </p>
          </div>

          {/* Client Logos Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center">
            {/* Client Logo Placeholders */}
            {[...Array(10)].map((_, index) => (
              <div 
                key={index} 
                className="bg-gray-100 rounded-lg p-6 flex items-center justify-center h-32 hover:bg-gray-200 transition-colors duration-300"
              >
                {/* IMAGE PLACEHOLDER: Client Logo */}
                <div className="text-center text-gray-400">
                  <MdBusiness className="text-4xl mx-auto mb-2" />
                  <p className="text-xs font-semibold">Client Logo {index + 1}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Client Categories */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <MdBusiness className="text-4xl text-pink-500 mx-auto mb-3" />
              <h3 className="about-section-heading text-lg font-bold mb-2">Corporate</h3>
              <p className="about-section-text text-sm">Businesses & Companies</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <FaUsers className="text-4xl text-pink-500 mx-auto mb-3" />
              <h3 className="about-section-heading text-lg font-bold mb-2">Education</h3>
              <p className="about-section-text text-sm">Schools & Universities</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <FaAward className="text-4xl text-pink-500 mx-auto mb-3" />
              <h3 className="about-section-heading text-lg font-bold mb-2">Hospitality</h3>
              <p className="about-section-text text-sm">Hotels & Restaurants</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <FaGlobe className="text-4xl text-pink-500 mx-auto mb-3" />
              <h3 className="about-section-heading text-lg font-bold mb-2">NGOs</h3>
              <p className="about-section-text text-sm">Non-Profit Organizations</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <FaShieldAlt className="text-4xl text-pink-500 mx-auto mb-3" />
              <h3 className="about-section-heading text-lg font-bold mb-2">Government</h3>
              <p className="about-section-text text-sm">Government Institutions</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="about-cta-bg py-20 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your <span className="text-white">Printing Project</span>?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let our expert team help you bring your vision to life with professional printing solutions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="about-cta-button px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-300 text-center">
              Get Free Quote
            </Link>
            <Link to="/contact" className="about-cta-button-outline px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-300 text-center">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;