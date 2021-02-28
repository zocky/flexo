const { PluginBase } = require("./PluginBase");

exports.PluginAuth = class PluginAuth extends PluginBase {
  constructor(engine,{...rest}) {
    super(engine,rest);
    this.addAuthRoute('_auth', (...args)=>this.authenticate(...args));
  }
  authenticate = async(req,res) => {
    await this.fail(req, res, null, 401)
  }
  addAuthRoute = (prefix,cb) => {
    this.engine.addRoute('get', '/'+prefix+'/' + this.name, cb);
  }

  extractInfo = profile => ({})
  
  fail = async (req, res, challenge, status) => {
    await this.trigger('fail', req, res, challenge, status);
  }
  success = async (req, res, profile) => {
    const info = {authId: this.name, ...this.extractInfo(profile)};
    await this.trigger('success', req, res, info, profile)
  }
  error = (req, res, error) => {
    console.log(error);
    throw error;
  }
  redirect = (req, res, url, status) => {
    res.status(status);
    res.redirect(url);
  }
  pass = () => { }

}