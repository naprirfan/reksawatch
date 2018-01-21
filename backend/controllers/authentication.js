const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.JWT_SECRET);
}

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(422).send({ error: 'You must provide email and password'});
  }

  // See if a user with the given email exists
  User.findOne({ email: email }, function(err, existingUser) {
    if (err) return next(err);

    // If a user with email does exist, return an error
    if (existingUser) {

      // INFO: 422 = unprocessable entity
      return res.status(422).send({ error: 'Email is in use' });
    }

    // If a user with email does NOT exist, create and save user record
    const user = new User({
      email: email,
      password: password
    });

    user.save(function(err) {
      if (err) return next(err);

      // TODO: send email to user, click authentication link

      // Respond to request indicating the user was created
      res.json({ token: tokenForUser(user) });
    });

  });

}

// TODO: add checking if user's subscription has expired
exports.signin = function(req, res, next) {
  // User has already had their email & password authed.
  // We just need to give them the token
  // INFO: we have access to user object via req.user
  res.send({ token: tokenForUser(req.user) });
}
