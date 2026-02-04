const jwt = require('jsonwebtoken');
exports.authMiddleware = (req, res, next) => {
    const key = process.env.JWT_SECRET;
    try{
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer")){
            return res.status(401).json({message: 'No token provided'});
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, key);

        req.user = decoded; 
        next();
    }

    catch(error){
        res.status(401).json({error: error.message});
    }
};

exports.restrictUser = (...allowedRoles) => {
    return (req, res, next) => {
        if (!(allowedRoles.includes(req.user.role))){
            res.status(403).json({message: "You aren't allowed to update status"});
        }

        next();
    };
};