const userDB =  {
  users: require('../model/users.json'),
  setUsers: function(data) { this.users = data }
};


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fsPromises = require('fs/promises');
const path = require('path');


const handleLogin = async (req, res) => {
  const { user, password } = req.body;
  if(!user || !password){
    return res.status(400).json({
      "message": "User and password are required"
    });
  }

  // *check if the user exist in the local user.json
  const foundUser = userDB.users.find(person => person.username === user)
  if(!foundUser) return res.sendStatus(401) // unauthorized
  const match = await bcrypt.compare(password, foundUser.password);
  if(match) {
    // * create JWT if the user is found 
    const accessToken = jwt.sign(
      {"username": foundUser.username},
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '30s'}
    );

    const refreshToken = jwt.sign(
      {"username": foundUser.username},
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d'}
    );
    
    // saving refresh token with current user
    const otherUsers = userDB.users.filter(person => person.username !== foundUser.username);
    const currentUser = { ...foundUser, refreshToken };
    console.log(currentUser);
    userDB.setUsers([...otherUsers, currentUser]);
    await fsPromises.writeFile(
      path.join(__dirname, '..', 'model', 'users.json'),
      JSON.stringify(userDB.users)
    )

    // * refreshToken stored in the memory as http cookie
    //! never store accessToken or refreshToken as cookie 
    res.cookie('jwt', 
    refreshToken, 
    { httpOnly: true, 
     maxAge: 24 * 60 * 60 * 1000  //1day
    });

    // * accessToken available for frotend DEV
    res.status(200).json({ accessToken });
  }else {
    res.sendStatus(401);
  }
}

module.exports = {handleLogin};