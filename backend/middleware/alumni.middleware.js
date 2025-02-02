// File: backend/middleware/alumni.middleware.js

export const alumniRoute = (req, res, next) => {
    

    if (req.user && req.user.role === "alumni") {
      // console.log("in alumni middleware");
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Alumni only.' });
    }
  };
  