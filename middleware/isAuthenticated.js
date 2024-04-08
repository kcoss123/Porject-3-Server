const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  let token = req.headers.authorization || req.body.token || req.query.token;

  console.log("Authorization Token:", token);

  // Check if token exists and is not 'null' or 'undefined'
  if (!token || token === "null" || token === "undefined") {
    console.log("Token not found");
    return res.status(400).json({ message: "Token not found" });
  }

  // Remove 'Bearer ' prefix if it exists
  if (token.startsWith("Bearer ")) {
    token = token.slice(7); // Remove 'Bearer ' from the token
  }

  try {
    const tokenInfo = jwt.verify(token, process.env.SECRET);
    console.log("Decoded Token Information:", tokenInfo);
    
    // Add registrationType to the request object
    req.user = tokenInfo;
    req.registrationType = tokenInfo.registrationType;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
