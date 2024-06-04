const jwt = require("jsonwebtoken");

function generateToken(user) {
  const payload = {
    user: {
      id: user._id,
    },
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
}

function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        const newToken = generateToken(decoded.user);
        res.set("Authorization", newToken);
        req.user = decoded.user;
        next();
      } else {
        return res.status(401).json({ message: "Invalid token" });
      }
    } else {
      req.user = decoded.user;
      next();
    }
  });
}

module.exports = { generateToken, verifyToken };
