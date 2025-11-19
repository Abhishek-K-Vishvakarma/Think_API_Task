import jwt from "jsonwebtoken";
import User_Admin from "./schema/schema_model.js"
const verifyToken = async (req, res, next) => {
  const headerToken = req.headers.authorization?.split(" ")[1];

  if (!headerToken) {
    return res.status(401).json({ message: "Token missing", status_code: 401 });
  }

  try {
    const decoded = jwt.verify(headerToken, process.env.SECRET_KEY);
    const user = await User_Admin.findById(decoded._id);

    if (!user || user.token !== headerToken) {
      return res.status(403).json({ message: "Token expired!", status_code: 403 });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid or expired token",
      status_code: 403,
    });
  }
};

export default verifyToken;

