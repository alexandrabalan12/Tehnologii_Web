import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify({ message: "Token not provided" }));
    res.end();
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.write(JSON.stringify({ message: "Invalid token" }));
      res.end();
      return;
    }
    req.user = user;
    next();
  });
};

const protectedRoute = (handler) => (req, res) => {
  authenticateToken(req, res, () => {
    handler(req, res);
  });
};

export default protectedRoute;
