import { Link } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import './LatestWork.css';

const LatestWork = () => {
  const productCategories = [
    {
      id: 1,
      title: "Rollups & Banners",
      description: "Professional retractable banner stands and large format banners for exhibitions, events, and outdoor advertising",
      // IMAGE PLACEHOLDER: Products collage (Rollups, Stickers, Signage, Billboard)
      imagePlaceholder: "Rollups & Banners Image"
    },
    {
      id: 2,
      title: "Stickers",
      description: "Custom round and shaped stickers for branding, labeling, and promotional purposes",
      // IMAGE PLACEHOLDER: Round stickers
      imagePlaceholder: "Stickers Image"
    },
    {
      id: 3,
      title: "Signage",
      description: "Wall signs, directional posts, and custom signage solutions for businesses and events",
      // IMAGE PLACEHOLDER: Signage (wall signs, directional posts)
      imagePlaceholder: "Signage Image"
    },
    {
      id: 4,
      title: "Billboards",
      description: "Large-scale outdoor billboard advertising with high-resolution graphics and weather-resistant materials",
      // IMAGE PLACEHOLDER: Billboard
      imagePlaceholder: "Billboard Image"
    },
    {
      id: 5,
      title: "Branded Merchandise",
      description: "Tents, DTF printed items, umbrellas, caps, tote bags, scarves, and promotional products",
      // IMAGE PLACEHOLDER: Branded merchandise collage
      imagePlaceholder: "Branded Merchandise Image"
    },
    {
      id: 6,
      title: "Flags & Banners",
      description: "Feather flags, teardrop flags, blade flags, rectangle flags, desk flags, pennants, and standard flags",
      // IMAGE PLACEHOLDER: Flags & banners collection
      imagePlaceholder: "Flags & Banners Image"
    }
  ];

  const categories = ["All", "Rollups & Banners", "Stickers", "Signage", "Billboards", "Branded Merchandise", "Flags & Banners"];

  return (
    <div className="latest-work-page">
      {/* Hero Section */}
      <div className="about-hero-section text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            Our <span className="text-pink-400">Latest Work</span>
          </h1>
          <p className="text-xl lg:text-2xl mb-8 max-w-4xl mx-auto">
            Discover our portfolio of exceptional printing projects that showcase creativity, quality, and attention to detail
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  index === 0 
                    ? 'bg-pink-500 text-white hover:bg-pink-600' 
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="latest-work-section-title text-4xl lg:text-5xl font-bold mb-6">
              Featured <span className="text-pink-500">Projects</span>
            </h2>
            <p className="latest-work-section-text text-xl max-w-3xl mx-auto">
              Each project represents our commitment to excellence and our passion for bringing creative visions to life through superior printing technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productCategories.map((item) => (
              <div key={item.id} className="latest-work-card group">
                <div className="relative overflow-hidden rounded-2xl">
                  {/* IMAGE PLACEHOLDER */}
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <FaEye className="text-4xl mx-auto mb-2" />
                      <p className="text-sm font-semibold">{item.imagePlaceholder}</p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {item.title}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-pink-500 transition-colors duration-300 mb-3">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {item.description}
                  </p>
                  
                  <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                    View Gallery
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="latest-work-stat">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-pink-100">Projects Completed</div>
            </div>
            <div className="latest-work-stat">
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-pink-100">Client Satisfaction</div>
            </div>
            <div className="latest-work-stat">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-pink-100">Happy Clients</div>
            </div>
            <div className="latest-work-stat">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-pink-100">Support Available</div>
            </div>
          </div>
        </div>
      </section>

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
            <Link to="/latest-work" className="about-cta-button-outline px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-300 text-center">
              View Full Portfolio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestWork;
