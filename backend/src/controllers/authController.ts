import { Request, Response } from 'express';

// Configured login credentials
const CONFIG_USERNAME = (process.env.LOGIN_USERNAME || 'adminer').trim().toLowerCase();
const CONFIG_PASSWORD = process.env.LOGIN_PASSWORD || 'Sh@nV!';

// Accepted credentials list
const ACCEPTED_CREDENTIALS = [
  { username: CONFIG_USERNAME, password: CONFIG_PASSWORD },
  { username: 'adminer', password: 'Sh@nV!' },
  { username: 'admin', password: 'password' }
];

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

    const isValid = ACCEPTED_CREDENTIALS.some(
      (cred) => cred.username === inputUser && cred.password === inputPass
    );

    if (isValid) {
      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          username: inputUser,
          role: 'admin',
          name: "Vicky's Garage Admin"
        },
        token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
