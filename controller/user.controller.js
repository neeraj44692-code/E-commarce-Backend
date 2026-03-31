import userModel from "../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import { VerifyEmail } from "../EmailVerify/Verifyemail.js";
import { Session } from "../model/sessionModel.js";

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are Required" });
    }
    const user = await userModel.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User Already Registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });
    // VerifyEmail(token, email);
    // newUser.token = token;
    res.cookie("token", token);
    await newUser.save();
    return res.status(200).json({
      success: true,
      message: "User Registered Successfully",
      user: newUser,
      token,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verify = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        success: false,
        message: "Authorization token is missing or Invalid",
      });
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      if (error.name === "TokenExpierdError") {
        return res.status(400).json({
          success: false,
          message: "The Registration TokenHas Expierd",
        });
      }
      return res
        .status(400)
        .json({ success: false, message: "Token Verification Failed" });
    }
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    user.token = null;
    user.isVerified = true;
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Email Verified Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reVerify = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10min",
    });
    VerifyEmail(token, email); // send mail here
    user.token = token;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Verification mail sent again successfully",
      token: user.token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const existingUser = await userModel.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User not exist" });
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }
    if (existingUser.isVerified === false) {
      return res
        .status(400)
        .json({ success: false, message: "Firstly Verify Afetr Then login" });
    }

    // token generate
    const accessToken = jwt.sign(
      { id: existingUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "10d" },
    );
    const refreshToken = jwt.sign(
      { id: existingUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "30d" },
    );

    existingUser.isLoggedIn = true;
    await existingUser.save();

    const existingSession = await Session.findOne({ userId: existingUser._id });
    if (existingSession) {
      await Session.deleteOne({ userId: existingUser._id });
    }

    await Session.create({ userId: existingUser._id });
    return res.status(200).json({
      success: true,
      message: `Welcome Again ${existingUser.firstName}`,
      user: existingUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.id;
    await Session.deleteMany({ userId: userId });
    await userModel.findByIdAndUpdate(userId, { isLoggedIn: false });
    return res
      .status(200)
      .json({ success: true, message: "User logged out succcessfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const allUser = async (_, res) => {
  try {
    const users = await userModel.find();
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export const updateUser = async (res, req) => {
//   try {
//     const userIDToUpdate = req.params.id // id of uer that we want to update
//     const loggedInUser = req.user //from isauthentication
//     const {firsatName, lastName, address, city, zipCode, phoneNo, role} = req.body

//     if(loggedInUser._id.toString() !== userIDToUpdate && loggedInUser.role !== 'admin')
// {return res.status(403).json({
//   success:false,
//   message:"You have not access to update this profile "
// })}

// let user= await userModel.findById(userIDToUpdate);
// if(!user){
//   return res.status(404).json({
//     success:false,
//     message:"user not found"
//   })
// }

// let profilePicUrl = user.profilePic
// let profilePicPublicId = user.profilePicPublicId

// // when new file uploaded

// if(req.file){}
//     } catch (error) {
//     return res.status(500).json({
//       console.log(error)
//     })
//   }
// };
