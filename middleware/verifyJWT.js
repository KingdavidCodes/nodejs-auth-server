const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization
  
  if(!authHeader) return res.sendStatus(401);
  console.log(authHeader); // Bearer token

  if(authHeader && authHeader.startsWith('Bearer')){
    token = authHeader.split(' ')[1];
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      (err, decoded) => {
        if(err) return res.sendStatus(403); // ! invalid token
        req.user = decoded.username;
        next();
      }
    );
  }
}


module.exports = verifyJWT;

