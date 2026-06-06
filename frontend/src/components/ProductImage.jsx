const ProductImage = ({ src, name, className = '' }) => {
  const placeholder = `https://placehold.co/400x400/e2e8f0/64748b?text=${encodeURIComponent(name || 'Product')}`;

  return (
    <img
      src={src || placeholder}
      alt={name || 'Product'}
      className={className}
      onError={(e) => {
        if (e.target.src !== placeholder) {
          e.target.src = placeholder;
        }
      }}
    />
  );
};

export default ProductImage;
