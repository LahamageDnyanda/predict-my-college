const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_123";

/**
 * verifyToken
 * -----------
 * Validates the Bearer JWT. Attaches decoded payload to req.user.
 * Allows the request to proceed even if no token is present (req.user stays null).
 * Use requireAuth if you need a hard guard.
 */
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

/**
 * requireAuth
 * -----------
 * Hard guard — rejects the request if no valid token is present.
 */
exports.requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required. Please log in." });
  }
  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token. Please log in again." });
  }
};

/**
 * requireAdmin
 * ------------
 * Must be used AFTER requireAuth. Rejects if role !== 'admin'.
 */
exports.requireAdmin = (req, res, next) => {
  exports.requireAuth(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Access denied: Admin privileges required." });
    }
    next();
  });
};
