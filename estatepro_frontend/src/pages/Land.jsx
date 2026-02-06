import PropertyCard from '../components/common/PropertyCard';
import properties from '../data/DummyProperties.json';

function Land() {
  
  const landProperties = properties.filter(property => 
    property.type === 'Land' || 
    property.type.toLowerCase() === 'land' ||
    property.category === 'Land'
  );

  return (
    <div className="min-h-screen bg-bg-soft py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-text-primary text-center mb-4">
          Buy Land in Nigeria
        </h1>
        <p className="text-xl text-text-muted text-center mb-12">
          Secure prime residential, commercial, and agricultural plots across the country
        </p>

        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-24">
              <h3 className="text-xl font-bold text-text-primary mb-6">Filters</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Location</label>
                  <select className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>All Locations</option>
                    <option>Lagos</option>
                    <option>Abuja</option>
                    <option>Ibadan</option>
                    <option>Epe</option>
                    <option>Port Harcourt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Size (sqm)</label>
                  <input type="number" placeholder="Min" className="w-full px-4 py-3 border border-border-light rounded-lg mb-2" />
                  <input type="number" placeholder="Max" className="w-full px-4 py-3 border border-border-light rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Title Type</label>
                  <select className="w-full px-4 py-3 border border-border-light rounded-lg">
                    <option>Any</option>
                    <option>C of O</option>
                    <option>Governor's Consent</option>
                    <option>Registered Survey</option>
                    <option>Deed of Assignment</option>
                  </select>
                </div>

                <button className="w-full btn-primary py-4">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-8">
              <p className="text-text-muted">
                {landProperties.length} land plot{landProperties.length !== 1 ? 's' : ''} available
              </p>
              <select className="px-4 py-2 border border-border-light rounded-lg">
                <option>Sort by: Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Size: Largest First</option>
              </select>
            </div>

            {landProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {landProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-2xl text-text-muted">
                  No land listings available at the moment.
                </p>
                <p className="text-text-muted mt-4">
                  Check back soon for new plots!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Land;