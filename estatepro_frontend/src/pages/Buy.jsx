import { Link } from 'react-router-dom';
import PropertyCard from '../components/common/PropertyCard';
import properties from '../data/DummyProperties.json';

function Buy() {
  const buyProperties = properties.filter(p => p.type === 'For Sale');

  return (
    <div className="min-h-screen bg-bg-soft py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-text-primary text-center mb-4">
          Buy Properties in Nigeria
        </h1>
        <p className="text-xl text-text-muted text-center mb-12">
          Find your dream home to own — luxury apartments, houses, and land
        </p>

        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-24">
              <h3 className="text-xl font-bold text-text-primary mb-6">Filters</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Location</label>
                  <select className="w-full px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-primary">
                    <option>All Locations</option>
                    <option>Lagos</option>
                    <option>Abuja</option>
                    <option>Port Harcourt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Property Type</label>
                  <select className="w-full px-4 py-3 border border-border-light rounded-lg">
                    <option>All Types</option>
                    <option>House</option>
                    <option>Apartment</option>
                    <option>Land</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Price Range</label>
                  <input type="text" placeholder="Min" className="w-full px-4 py-3 border border-border-light rounded-lg mb-2" />
                  <input type="text" placeholder="Max" className="w-full px-4 py-3 border border-border-light rounded-lg" />
                </div>
                <button className="w-full btn-primary">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-8">
              <p className="text-text-muted">{buyProperties.length} properties found</p>
              <select className="px-4 py-2 border border-border-light rounded-lg">
                <option>Sort by: Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {buyProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {buyProperties.length === 0 && (
              <p className="text-center text-text-muted py-20">No properties found matching your criteria.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Buy;