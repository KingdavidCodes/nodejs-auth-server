const userDB =  {
  users: require('../model/users.json'),
  setUsers: function(data) { this.users = data }
};
const fsPromises = require('fs/promises');
const path = require('path');



const handleLogout =  async (req, res) => {
  // on client, also delete the accessToken

  const cookies = req.cookies;
  if(!cookies?.jwt){
    return res.sendStatus(204); // no contenet
  }
  const refreshToken = cookies.jwt;

  // * searching if refreshToken is in DB
  const foundUser = userDB.users.find(person => person.refreshToken === refreshToken);
  if(!foundUser){
    res.clearCookie('jwt', 
    { httpOnly: true, 
      maxAge: 24 * 60 * 60 * 1000
    })
    return res.sendStatus(204)
  }

  // delete the refreshToken in db
  const otherUsers = userDB.users.filter(person => person.refreshToken !== foundUser.refreshToken);

  const currentUser = {...foundUser, refreshToken: ''};
  userDB.setUsers([...otherUsers, currentUser]);

  await fsPromises.writeFile(
    path.join(__dirname, '..', 'model', 'users.json'),
    JSON.stringify(userDB.users)
  );

  // ! when migrating to online server useing https use the flag secure: true. Since we are only using a dev http server
  res.clearCookie('jwt', 
  { httpOnly: true, 
    maxAge: 24 * 60 * 60 * 1000
  });
  res.sendStatus(204);
}

module.exports = { handleLogout }