/**
 * ProductCard component
 * Displays a single product with its image, name, and price.
 */

export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h2>{product.name}</h2>
      <p>{product.price}</p>
      {/* Add to cart button will go here */}
    </div>
  );
}
