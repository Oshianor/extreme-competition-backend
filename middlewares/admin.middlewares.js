
module.exports = function (req, res, next) { 
  // 401 Unauthorized
  // 403 Forbidden 
  console.log("req.user", req.user);
  
  if (req.user.isAdmin === 0) return res.status(403).send('Access denied.');

  next();
}