const {PluginBase} = require("./PluginBase");

exports.PluginAuth = class PluginAuth extends PluginBase {
  async authenticate(req) {
    return false;
  }

  fail = async (req,res,challenge,status) => {
    await this.trigger('fail', req, res, challenge, status);
  }
  success = async (req,res,user, info) => {
    await this.trigger('success', req, res, user, info)
  }
  error = (req,res,error) => {
    console.log(error);
    res.error(error);
  }
  redirect = (req,res,url, status) => {
    res.status(status);
    res.redirect(url);
  }
  pass = () => {}

}