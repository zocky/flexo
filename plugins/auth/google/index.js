var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

exports.Plugin = engine => class AuthGoogle extends engine.Plugin.Auth.Passport {
  constructor(engine, {
    clientID,
    clientSecret,
    callbackURL,
    scope = [
      'auth/userinfo.profile'
    ] || [],
    ...rest
  }) {
    super(engine, rest);
    this.scope = ['auth/userinfo.email', ...scope].map(
      it => engine.utils.urlResolve('https://www.googleapis.com', it)
    )
    this.authArgs = [{ scope: this.scope }];

    this.strategy = new GoogleStrategy({
      clientID,
      clientSecret,
      callbackURL
    },
      this.strategyCallback
    );
    this.setupRoutes('google', {
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    });
  }
  suggestUsername = profile => profile.emails[0].value.split('@')[0];
  extractEmail = profile => profile.emails[0].value
}
