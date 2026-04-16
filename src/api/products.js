/**
 * Products API route handler.
 * Handles requests related to product data.
 */

export default function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      // TODO: Fetch products from database
      res.status(200).json({ products: [] });
      break;
    case "POST":
      // TODO: Create a new product
      res.status(201).json({ message: "Product created" });
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
