/**
 * Users API route handler.
 * Handles requests related to user data.
 */

export default function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      // TODO: Fetch users from database
      res.status(200).json({ users: [] });
      break;
    case "POST":
      // TODO: Register a new user
      res.status(201).json({ message: "User registered" });
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
