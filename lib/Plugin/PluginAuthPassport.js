const { PluginAuth } = require("./PluginAuth.js");

exports.PluginAuthPassport = class PluginAuthPassport extends PluginAuth {
  constructor(engine, { strategy, ...rest }) {
    super(engine, rest);
    const { Strategy, args = [], options = {} } = strategy;
    this.authArgs = args;
    this.strategyOptions = options;

    this.strategy = new Strategy(
      this.strategyOptions,
      this.strategyCallback
    );
  }
  setup() {
    super.setup();
    this.addAuthRoute('login', (...args)=>this.authenticate(...args));
  }
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
    const strategy = this.strategy;
    strategy.error = this.error.bind(this, req, res);
    strategy.redirect = this.redirect.bind(this, req, res);
    strategy.success = this.success.bind(this, req, res);
    strategy.fail = this.fail.bind(this, req, res);
    strategy.pass = this.pass.bind(this, req, res);
    return strategy;
  }
}