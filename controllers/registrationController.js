const userDB =  {
  users: require('../model/users.json'),
  setUsers: function(data) { this.users = data }
};

const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');


const handleNewUser = async (req, res) => {
  const { user, password } = req.body;
  if(!user || !password){
    return res.status(400).json({
      "message": "User and password are required"
    });
  }

  // * check duplicate users in the DB it returns the value
  const duplicate = userDB.users.find(person => person.username === user);
  console.log(duplicate);
  // !check the diff of sendStatus and status in nodeJS
  if(duplicate) return res.sendStatus(409) // ! HTTP confict in db

  try {
    // encrypt password
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const newUser = { 
      'username': user, 
      'password': hashPassword 
    };
    userDB.setUsers([...userDB.users, newUser]);

    await fs.writeFile(
      path.join(__dirname, '..', 'model', 'users.json'),
      JSON.stringify(userDB.users)
    );
    console.log(userDB.users);
    res.status(200).json({
      'success': `New user ${user} created!`
    })
  } catch (error) {
    res.status(500).json({'message': error.message });
  }
}


module.exports = {
  handleNewUser
}