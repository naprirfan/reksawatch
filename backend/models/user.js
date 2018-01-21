const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

// Define our model. Subscription expired at 90 days from now
const userSchema = new Schema({
  email: { type: String, unique: true, lowercase: true },
  password: String,
  created_at: { type: Date, default: Date.now },
  subscription_expire_at: { type: Date, default: new Date(+new Date() + 90*24*60*60*1000) },
  is_confirmed: { type: Boolean, default: false }
});

// On save hook, encrypt password
userSchema.pre('save', function(next) {
  const user = this;

  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);

      user.password = hash;
      next();
    });

  });
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return callback(err);

    callback(null, isMatch);
  });
}

// Create the model class
const ModelClass = mongoose.model('user', userSchema);

// Export the model
module.exports = ModelClass;
