const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
    console.log('here-server');
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { _id: decoded.userId };
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid authentication token' });
    }
};

module.exports = { authenticate }; 