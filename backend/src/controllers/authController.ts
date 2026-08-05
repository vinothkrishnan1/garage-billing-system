import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/authMiddleware';

const CONFIG_USERNAME = (process.env.LOGIN_USERNAME || 'adminer').trim().toLowerCase();
const CONFIG_PASSWORD = process.env.LOGIN_PASSWORD || 'Sh@nV!';

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: 'Invalid username or password.'
      });
      return;
    }

    const inputUser = String(username).trim().toLowerCase();
    const inputPass = String(password).trim();

    // Check against configured admin credentials from environment or secured defaults
    const isValid = inputUser === CONFIG_USERNAME && inputPass === CONFIG_PASSWORD;

    if (isValid) {
      const payload = {
        username: inputUser,
        role: 'admin',
        name: "Vicky's Garage Admin"
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: payload,
        token
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }
  } catch (error) {
    console.error('Error during login authentication:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};
