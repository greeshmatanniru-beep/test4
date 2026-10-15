import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { generateToken } from '../middleware/auth.js';
import { loginSchema, registerSchema } from '../validators/validators.js';

export async function login(req, res) {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors.map(e => e.message)
      });
    }

    const { email, password } = parseResult.data;
    const user = await db.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
    }

    const token = generateToken(user);

    await db.createAuditLog({
      user_id: user.id,
      action: 'USER_LOGIN',
      details: { role: user.role, department: user.department },
      ip_address: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    });

    const { password_hash, ...safeUser } = user;
    return res.json({
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
}

export async function register(req, res) {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors.map(e => e.message)
      });
    }

    const { email, password, fullName, role, department } = parseResult.data;
    const existing = await db.findUserByEmail(email);

    if (existing) {
      return res.status(409).json({ error: 'User with this corporate email already exists.' });
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await db.createUser({
      email,
      password_hash,
      full_name: fullName,
      role,
      department
    });

    const token = generateToken(newUser);

    await db.createAuditLog({
      user_id: newUser.id,
      action: 'USER_REGISTERED',
      details: { role: newUser.role, department: newUser.department },
      ip_address: req.ip || '127.0.0.1'
    });

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ user });
  } catch (err) {
    console.error('Profile fetch error:', err);
    return res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
}

export async function listAllUsers(req, res) {
  try {
    const users = await db.listUsers(req.user);
    return res.json({ users });
  } catch (err) {
    console.error('List users error:', err);
    return res.status(500).json({ error: 'Failed to list corporate users.' });
  }
}
