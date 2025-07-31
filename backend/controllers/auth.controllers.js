import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler, AppError } from "../lib/handlers.js";

const generateToken = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "10d",
  });
  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refreshToken:${userId}`,
    refreshToken,
    "EX",
    10 * 24 * 60 * 60
  );
};

const setCookie = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV == "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV == "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError("All fields are required", 400);
  }

  const userExist = await User.findOne({ email });
  if (userExist) {
    throw new AppError("User already exists", 400);
  }

  const user = await User.create({ name, email, password });

  const { accessToken, refreshToken } = generateToken(user._id);
  await storeRefreshToken(user._id, refreshToken);

  setCookie(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid Email", 401);
  }

  if (!(await user.comparePassword(password))) {
    throw new AppError("Invalid Password", 401);
  }

  const { accessToken, refreshToken } = generateToken(user._id);
  await storeRefreshToken(user._id, refreshToken);

  setCookie(res, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    message: "Login successful",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    await redis.del(`refreshToken:${decoded.userId}`);
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});
