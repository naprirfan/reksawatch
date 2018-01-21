exports.getHomepage = function(req, res, next) {
  return res.render('homepage', {user: req.session.passport && req.session.passport.user});
}

exports.getAccountNeedActivation = function(req, res, next) {
  return res.render('account_need_activation', { email: req.params.email });
}
