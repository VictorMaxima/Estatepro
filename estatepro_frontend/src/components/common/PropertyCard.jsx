// src/components/common/PropertyCard.jsx
import { Link } from 'react-router-dom';

function PropertyCard({ property, linkTo }) {
  // Fallbacks
  const imageUrl = property.image || property.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image';
  const title = property.title || 'Untitled Property';
  const price = property.price ? `₦${parseInt(property.price).toLocaleString()}` : 'Price on Request';
  const location = property.location || 'Location N/A';
  const type = property.type || property.property_type || 'Property';
  const beds = property.beds || property.bedrooms || '-';
  const baths = property.baths || property.bathrooms || '-';
  const sqft = property.sqft || property.size || '-';

  return (
    <Link
      to={linkTo || `/properties/detail/${property.slug || property.id || 'unknown'}`}
      className="block h-full group"
    >
      <div className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold">
            {type}
          </span>
          <span className="absolute top-4 right-4 bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold">
            {price}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col grow">
          <h3 className="text-xl font-bold text-text-primary mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          <p className="text-text-muted mb-4">{location}</p>

          <div className="flex gap-6 text-sm text-text-muted mb-6 grow">
            <span>{beds} Beds</span>
            <span>{baths} Baths</span>
            <span>{sqft} sqft</span>
          </div>

          {/* No inner Link - the whole card is clickable */}
          <div className="mt-auto">
            <span className="block text-center py-3 bg-primary text-white rounded-lg font-semibold group-hover:bg-primary-dark transition">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PropertyCard;