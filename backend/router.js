// Controllers
const AuthenticationCtrl = require('./controllers/authentication');
const ApiCtrl = require('./controllers/api');
const InitialScriptCtrl = require('./controllers/initial_script');

// Services
const passportService = require('./services/passport');
const passport = require('passport');

// INFO: session = false means we don't want passport to create cookie
const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

module.exports = function(app) {
  app.get('/', function(req, res, next) {
    return res.send("Hello there")
  });

  // Authentication Controller
  app.post('/signin', requireSignin, AuthenticationCtrl.signin);
  app.post('/signup', AuthenticationCtrl.signup);

  // API Controller
  app.get('/cron/get_recommendation', ApiCtrl.getRecommendation);
  app.get('/cron/get_mutual_fund_list', ApiCtrl.getMutualFundList);
  app.get('/secret_init_script/db_seed', InitialScriptCtrl.initJKSEPrice);

  app.get('/get_recommendation', requireAuth, ApiCtrl.getRecommendation);
  app.get('/get_data_for_graphic', requireAuth, ApiCtrl.getDataForGraphic);
  app.get('/get_mutual_fund_list', requireAuth, ApiCtrl.getMutualFundList);

}
