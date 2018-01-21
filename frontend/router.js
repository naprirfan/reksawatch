// TODO: Implement this spec:
// http://stackoverflow.com/jobs/138154/full-stack-javascript-developer-wearereasonablepeople

// Modules
const flash = require('req-flash');

// Controllers
const StaticCtrl = require('./controllers/static');
const AuthenticationCtrl = require('./controllers/authentication');
const RecommendationCtrl = require('./controllers/recommendation');
const GraphicCtrl = require('./controllers/graphic');

// Services
const passportService = require('./services/passport');
const passport = require('passport');
const requireSignin = passport.authenticate('local', {
  failureRedirect: '/signin'
});
const requireAuth = function(req, res, next) {
  if (req.session.passport && req.session.passport.user) {
    return next();
  }

  req.flash('type', 'error');
  req.flash('message', 'Silakan login terlebih dahulu')
  return res.redirect('/signin');
};
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// Securities
const bodyParser = require('body-parser');
const csrf = require('csurf')
const csrfProtection = csrf({ cookie: true });
const parseForm = bodyParser.urlencoded({ extended: false });

module.exports = function(app) {

  // Static Page Controller
  app.get('/', StaticCtrl.getHomepage);

  app.get('/account_need_activation/:email', StaticCtrl.getAccountNeedActivation);

  // Authentication Controller
  app.get('/signin', csrfProtection, AuthenticationCtrl.getSigninPage);

  // TODO: implement req.flash. Login failed scenario
  app.post('/signin', parseForm, csrfProtection, requireSignin, AuthenticationCtrl.doSignin);

  app.get('/signup', csrfProtection, AuthenticationCtrl.getSignupPage)

  // TODO: implement req.flash. Signup failed scenario
  app.post('/signup', parseForm, csrfProtection, AuthenticationCtrl.doSignup);

  app.get('/signout', AuthenticationCtrl.doSignout);

  // Recommendation Controller
  app.get('/rekomendasi', requireAuth, RecommendationCtrl.getIndexPage);

  // Graphic controller
  app.get('/get_data_for_graphic', requireAuth, GraphicCtrl.getGraphicData);
  app.get('/get_mutual_fund_list', requireAuth, GraphicCtrl.getMutualFundList);

}
