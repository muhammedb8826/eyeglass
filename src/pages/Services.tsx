import { Link } from "react-router-dom";
import { FaPrint, FaCut, FaShieldAlt, FaAward, FaPalette, FaRocket, FaLightbulb } from "react-icons/fa";
import { MdPrint, MdBusiness, MdLocalPrintshop, MdSpeed, MdSupport } from "react-icons/md";
import './Services.css';

// ServiceCardProps interface removed as it's not being used

const Services = () => {
  // 14 Services from "Our Service" screenshot
  const services = [
    {
      icon: <FaPrint className="text-4xl" />,
      title: "Rollups",
      description: "Professional retractable banner stands for exhibitions and events"
    },
    {
      icon: <FaPalette className="text-4xl" />,
      title: "Sticker Print",
      description: "Custom stickers for branding, labeling, and promotional purposes"
    },
    {
      icon: <MdPrint className="text-4xl" />,
      title: "Light Box",
      description: "Illuminated display boxes for eye-catching advertising"
    },
    {
      icon: <FaCut className="text-4xl" />,
      title: "DTF Print",
      description: "Direct to Film printing for vibrant, durable designs on various surfaces"
    },
    {
      icon: <MdBusiness className="text-4xl" />,
      title: "Car Branding",
      description: "Vehicle wraps and graphics for mobile advertising"
    },
    {
      icon: <FaLightbulb className="text-4xl" />,
      title: "Neon Light",
      description: "Custom neon signs and lighting solutions"
    },
    {
      icon: <MdLocalPrintshop className="text-4xl" />,
      title: "Plotter",
      description: "Precision cutting and printing for signage and graphics"
    },
    {
      icon: <FaPrint className="text-4xl" />,
      title: "Banner Print",
      description: "Large format banners for indoor and outdoor advertising"
    },
    {
      icon: <FaPalette className="text-4xl" />,
      title: "Giveaway Materials",
      description: "Promotional items and branded merchandise"
    },
    {
      icon: <MdPrint className="text-4xl" />,
      title: "Different Signage",
      description: "Custom signage solutions for businesses and events"
    },
    {
      icon: <FaPrint className="text-4xl" />,
      title: "UV Print",
      description: "UV printing technology for high-quality, durable prints"
    },
    {
      icon: <FaCut className="text-4xl" />,
      title: "Engrave",
      description: "Precision engraving services for various materials"
    },
    {
      icon: <FaPrint className="text-4xl" />,
      title: "Flag Print",
      description: "Custom flags and banners for events and branding"
    },
    {
      icon: <FaPrint className="text-4xl" />,
      title: "Sublimation",
      description: "Sublimation printing for textiles and fabric products"
    }
  ];

  const features = [
    {
      icon: <FaShieldAlt className="text-3xl" />,
      title: "Quality Guaranteed",
      description: "Every print job meets our strict quality standards with satisfaction guaranteed"
    },
    {
      icon: <MdSpeed className="text-3xl" />,
      title: "Fast Turnaround",
      description: "Rush printing services with same-day or next-day options for urgent projects"
    },
    {
      icon: <MdSupport className="text-3xl" />,
      title: "Expert Support",
      description: "Personalized consultation and design assistance from our experienced team"
    },
    {
      icon: <FaAward className="text-3xl" />,
      title: "Award Winning",
      description: "Recognized for excellence in printing quality and customer service"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Full Width */}
      <section className="about-hero-section text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-6">
              Professional Printing Services
              </span>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Our <span className="text-pink-400">Printing Services</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto font-semibold">
              From concept to completion, we deliver exceptional printing solutions that elevate your brand and exceed expectations
            </p>
            <div className="flex justify-center space-x-8 text-center">
              <div className="flex flex-col items-center">
                <FaPrint className="text-4xl text-pink-400 mb-2" />
                <span className="text-lg font-semibold">Premium Quality</span>
              </div>
              <div className="flex flex-col items-center">
                <FaCut className="text-4xl text-pink-400 mb-2" />
                <span className="text-lg font-semibold">Precision Cutting</span>
              </div>
              <div className="flex flex-col items-center">
                <FaRocket className="text-4xl text-pink-400 mb-2" />
                <span className="text-lg font-semibold">Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid - Contained Width */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="services-section-title font-semibold text-lg uppercase tracking-wide">Our Services</span>
            <h2 className="services-section-heading text-4xl font-bold mt-4 mb-6">
              Comprehensive <span className="text-pink-500">Printing Solutions</span>
            </h2>
            <p className="services-section-text text-xl max-w-3xl mx-auto">
              We offer a complete range of professional printing services to meet all your business needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="services-card p-6 text-center">
                <div className="services-icon mx-auto mb-4">
                  {service.icon}
                </div>
                <h3 className="services-section-heading text-xl font-bold mb-2">{service.title}</h3>
                <p className="services-section-text text-sm">{service.description}</p>
                <Link to="/contact" className="services-cta-button w-full mt-4 py-2 rounded-lg font-semibold text-sm text-center block">
                  Get Quote
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Contained Width */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="services-section-title font-semibold text-lg uppercase tracking-wide">Why Choose Us</span>
            <h2 className="services-section-heading text-4xl font-bold mt-4 mb-6">
              The <span className="text-pink-500">IAN PRINT</span> Advantage
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="services-feature-card p-8 text-center">
                <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="text-pink-500">{feature.icon}</div>
                </div>
                <h3 className="services-section-heading text-xl font-bold mb-3">{feature.title}</h3>
                <p className="services-section-text">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Machines Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="services-section-title font-semibold text-lg uppercase tracking-wide">Our Technology</span>
            <h2 className="services-section-heading text-4xl font-bold mt-4 mb-6">
              Our <span className="text-pink-500">Machines</span>
            </h2>
            <p className="services-section-text text-xl max-w-3xl mx-auto">
              State-of-the-art equipment powering our printing solutions
            </p>
          </div>

          {/* Flex Printing Introduction */}
          <div className="mb-12 bg-white p-8 rounded-lg shadow-lg">
            <p className="services-section-text text-lg leading-relaxed text-center max-w-4xl mx-auto">
              IAN Printing Solution specializes in flex printing, using flexible materials like vinyl to create eye-catching banners, hoardings, vehicle wraps, and other large-format prints. Flex printing ensures high-resolution graphics with vivid colors and excellent weather resistance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Sublimation Machines */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="services-section-heading text-2xl font-bold mb-4 text-red-600">Sublimation Machines</h3>
              {/* IMAGE PLACEHOLDER: Sublimation Machine */}
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mb-4">
                <div className="text-center text-gray-500">
                  <FaPrint className="text-4xl mx-auto mb-2" />
                  <p className="text-sm font-semibold">Sublimation Machine</p>
                </div>
              </div>
              <p className="services-section-text leading-relaxed">
                Our textile printing services cater to the fashion industry and other textile-related businesses. Using advanced techniques such as sublimation or direct-to-garment (DTG) printing, IAN Printing Solution can produce vibrant designs on various fabrics, including cotton, polyester, silk, and more.
              </p>
            </div>

            {/* DTF Machines */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="services-section-heading text-2xl font-bold mb-4 text-red-600">DTF Machines</h3>
              {/* IMAGE PLACEHOLDER: DTF Machine */}
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mb-4">
                <div className="text-center text-gray-500">
                  <FaPrint className="text-4xl mx-auto mb-2" />
                  <p className="text-sm font-semibold">DTF Machine</p>
                </div>
              </div>
              <p className="services-section-text leading-relaxed">
                Ian Print plc utilizes state-of-the-art DTF printing technology to deliver high quality prints on various surfaces such as fabric, wood, metal, glass and more. DTF printing offers vibrant colors, excellent durability, and precise detailing, making it an ideal choice for custom apparel, home décor items, promotional materials, and personalized gifts.
              </p>
            </div>

            {/* Banner Machines */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="services-section-heading text-2xl font-bold mb-4 text-red-600">Banner Machines</h3>
              {/* IMAGE PLACEHOLDER: Banner Machine */}
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mb-4">
                <div className="text-center text-gray-500">
                  <FaPrint className="text-4xl mx-auto mb-2" />
                  <p className="text-sm font-semibold">Banner Machine (5 Meter)</p>
                </div>
              </div>
              <p className="services-section-text leading-relaxed">
                Large-format banner printing capabilities up to 5 meters wide. Perfect for outdoor advertising, event displays, and large-scale promotional materials.
              </p>
            </div>

            {/* UV Machines */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="services-section-heading text-2xl font-bold mb-4 text-red-600">UV Machines</h3>
              {/* IMAGE PLACEHOLDER: UV Machine */}
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mb-4">
                <div className="text-center text-gray-500">
                  <FaPrint className="text-4xl mx-auto mb-2" />
                  <p className="text-sm font-semibold">UV Flatbed Printer</p>
                </div>
              </div>
              <p className="services-section-text leading-relaxed">
                UV flatbed printing technology for printing on rigid and flexible substrates with exceptional quality and durability.
              </p>
            </div>

            {/* CNC Machines */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="services-section-heading text-2xl font-bold mb-4 text-red-600">CNC Machines</h3>
              {/* IMAGE PLACEHOLDER: CNC Machine */}
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mb-4">
                <div className="text-center text-gray-500">
                  <FaCut className="text-4xl mx-auto mb-2" />
                  <p className="text-sm font-semibold">CNC Routing Machine</p>
                </div>
              </div>
              <p className="services-section-text leading-relaxed">
                Precision cutting, engraving, and fabrication services using advanced CNC routing technology for various materials.
              </p>
            </div>

            {/* Laser Cutting Machine */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="services-section-heading text-2xl font-bold mb-4 text-red-600">Laser Cutting Machine</h3>
              {/* IMAGE PLACEHOLDER: Laser Cutting Machine */}
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mb-4">
                <div className="text-center text-gray-500">
                  <FaCut className="text-4xl mx-auto mb-2" />
                  <p className="text-sm font-semibold">Laser Cutting Machine</p>
                </div>
              </div>
              <p className="services-section-text leading-relaxed">
                Precision laser cutting, engraving, and marking services for various materials with exceptional accuracy and detail.
              </p>
            </div>

            {/* Plotter Machine */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="services-section-heading text-2xl font-bold mb-4 text-red-600">Plotter Machine</h3>
              {/* IMAGE PLACEHOLDER: Plotter Machine */}
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mb-4">
                <div className="text-center text-gray-500">
                  <FaPrint className="text-4xl mx-auto mb-2" />
                  <p className="text-sm font-semibold">Plotter Machine</p>
                </div>
              </div>
              <p className="services-section-text leading-relaxed">
                Wide-format printing for architectural blueprints, banners, posters, and vinyl cutting for signage and graphics.
              </p>
            </div>

            {/* Plasma Cutting Machine */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="services-section-heading text-2xl font-bold mb-4 text-red-600">Plasma Cutting Machine</h3>
              {/* IMAGE PLACEHOLDER: Plasma Cutting Machine */}
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mb-4">
                <div className="text-center text-gray-500">
                  <FaCut className="text-4xl mx-auto mb-2" />
                  <p className="text-sm font-semibold">Plasma Cutting Machine</p>
                </div>
              </div>
              <p className="services-section-text leading-relaxed">
                Industrial plasma cutting for thick conductive materials like steel, aluminum, and copper with precision and speed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section - Contained Width */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="services-section-title font-semibold text-lg uppercase tracking-wide">Our Process</span>
            <h2 className="services-section-heading text-4xl font-bold mt-4 mb-6">
              How We <span className="text-pink-500">Deliver Excellence</span>
            </h2>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="services-process-step bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-pink-500">1</span>
              </div>
              <h3 className="services-section-heading text-xl font-bold mb-3">Consultation</h3>
              <p className="services-section-text">We discuss your requirements and provide expert recommendations</p>
            </div>
            <div className="text-center">
              <div className="services-process-step bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-pink-500">2</span>
              </div>
              <h3 className="services-section-heading text-xl font-bold mb-3">Design & Proof</h3>
              <p className="services-section-text">Create your design and provide proofs for approval</p>
            </div>
            <div className="text-center">
              <div className="services-process-step bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-pink-500">3</span>
              </div>
              <h3 className="services-section-heading text-xl font-bold mb-3">Production</h3>
              <p className="services-section-text">High-quality printing with state-of-the-art equipment</p>
            </div>
            <div className="text-center">
              <div className="services-process-step bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-pink-500">4</span>
              </div>
              <h3 className="services-section-heading text-xl font-bold mb-3">Delivery</h3>
              <p className="services-section-text">Fast delivery to your doorstep or office</p>
            </div>
        </div>
      </div>
    </section>

      {/* CTA Section - Full Width */}
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

export default Services;
