const userDB =  {
  users: require('../model/users.json'),
  setUsers: function(data) { this.users = data }
};


const bcrypt = require('bcrypt');


const handleLogin = async (req, res) => {
  const { user, password } = req.body;
  if(!user || !password){
    return res.status(400).json({
      "message": "User and password are required"
    });
  }

  // *check if the user exist in the local user.json
  const foundUser = userDB.users.find(person => person.username === user)
  console.log(foundUser);
  if(!foundUser) return res.sendStatus(401) // unauthorized

  const matchPassword = await bcrypt.compare(password, foundUser.password);
  if(matchPassword) {
    res.status(200).json({
      'success': `User ${user} is logged in`
    })
  }else {
    res.sendStatus(401);
  }
}

module.exports = {handleLogin};