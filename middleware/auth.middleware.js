import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export function checkToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(403).send('Token not found');

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data;
        next();
    } catch(e) {
        res.status(401).json(e);
    }
}

export async function checkAdmin(req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        next();
    } catch(e) {
        res.status(500).json({ message: 'Server error checkAdmin', error: e.message });
    }
}