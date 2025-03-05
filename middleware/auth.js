const jwt = require("jsonwebtoken");
const { createResponse } = require("../utils/responseHelper");

const auth = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json(createResponse(401, false, "Access Denied"));
  }

  try {
    const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json(createResponse(401, false, "Invalid Token"));
  }
};

const admin = (req, res, next) => {
  if (req.user.role !== 1) {
    return res
      .status(403)
      .json(createResponse(403, false, "Access denied. Admins only."));
  }
  next();
};

module.exports = { auth, admin };
