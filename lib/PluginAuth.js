const { PluginBase } = require("./PluginBase");

exports.PluginAuth = class PluginAuth extends PluginBase {
  async authenticate(req,res) {
    await this.fail(req, res, null, 401)
  }

  suggestUsername = profile => profile.username;
  extractId = profile => profile.id;
  extractInfo = profile => ({
    authId:this.name,
    userId: this.extractId(profile) ,
    username: this.suggestUsername(profile)
  })
  
  fail = async (req, res, challenge, status) => {
    await this.trigger('fail', req, res, challenge, status);
  }
  success = async (req, res, profile) => {
    const info = this.extractInfo(profile);
    console.log(info);
    await this.trigger('success', req, res, info, profile)
  }
  error = (req, res, error) => {
    console.log(error);
    res.error(error);
  }
  redirect = (req, res, url, status) => {
    res.status(status);
    res.redirect(url);
  }
  pass = () => { }

}