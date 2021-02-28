const { PluginAuth } = require("./PluginAuth.js");

exports.PluginAuthPassport = class PluginAuthPassport extends PluginAuth {
    authenticate = async (req, res) => {
      const strategy = this.augmented(req, res);
      const args = [...this.authArgs];
      await this.strategy.authenticate(req, ...args);
    }
    authArgs = [];
    strategyCallback = (accessToken, refreshToken, profile, cb) => {
      return cb(null, profile);
    }
    augmented(req, res) {
      const strategy  = this.strategy;
      strategy.error = this.error.bind(this,req,res);
      strategy.redirect = this.redirect.bind(this,req,res);
      strategy.success = this.success.bind(this,req,res);
      strategy.fail = this.fail.bind(this,req,res);
      strategy.pass = this.pass.bind(this,req,res);
      return strategy;
    }
    setupRoutes(name=this.name,...args) {
      this.engine.addRoute('get','/login/' + name, this.authenticate);
      this.engine.addRoute('get','/_auth/' + name, this.authenticate);
    }
    service = {
      ...this.service,
      authenticate: this.authenticate
    }
  }