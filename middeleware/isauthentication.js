import jwt from "jsonwebtoken";
import userModel from "../model/user.model.js";

export const isauthentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        success: false,
        message: "Authorization Token Invalid or Missing",
      });
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      if (error.name === "TokenExpierd Error") {
        return res.status(400).json({
          success: false,
          message: "The Registration Token Has Expierd",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Access token is invalid or missing",
      });
    }
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    req.user = user;
    req.id = user._id;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied,Admins only" });
  }
};
