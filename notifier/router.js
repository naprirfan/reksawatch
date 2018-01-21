module.exports = function(app) {

  // Static Page Controller
  app.get('/', function(req, res, next) { return res.end('hello world'); });

}
