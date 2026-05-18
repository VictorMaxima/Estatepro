// src/components/common/PropertyCard.jsx
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../config/Api';

function PropertyCard({ property, linkTo }) {
  // Guard clause - handle null/undefined property
  if (!property) {
    return null; // or return a placeholder/skeleton
  }

  // Safe fallbacks for all fields
  const imageUrl = property?.images?.[0]?.image_url 
  ? `${BASE_URL}${property.images[0].image_url}` 
  : 'https://via.placeholder.com/1200x800?text=Property+Image';
  const title = property.title || 'Untitled Property';
  const price = property.price ? `₦${parseInt(property.price).toLocaleString()}` : 'Price on Request';
  const location = property.location || 'Location N/A';
  const type = property.type || property.property_type || 'Property';
  const beds = property.beds || property.bedrooms || '-';
  const baths = property.baths || property.bathrooms || '-';
  const sqft = property.sqft || property.size || '-';

  // Slug fallback for link
  const id = property.id || 'unknown';

  return (
    <Link
      to={linkTo || `/properties/detail/${id}`}
      className="block h-full group no-underline"
    >
      {/* Rest of your JSX */}
      <div className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Image Section */}
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

          {/* View Details Button */}
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