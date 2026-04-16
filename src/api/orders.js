/**
 * Orders API route handler.
 * Handles requests related to order data.
 */

export default function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      // TODO: Fetch orders from database
      res.status(200).json({ orders: [] });
      break;
    case "POST":
      // TODO: Create a new order
      res.status(201).json({ message: "Order created" });
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
