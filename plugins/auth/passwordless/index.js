exports.Plugin = engine => class AuthPasswordless extends engine.Plugin.Auth {
  constructor(engine, { email, store, ...rest }) {
    super(engine, rest);
    this.store = engine.getOrCreateService(store);
    this.email = engine.getOrCreateService(email);
  }

  authenticate = async (req,res) => {
    const { token,email } = req.query;
    console.log('auth',email,token)
    const stored = await this.store.get(email);
    if (stored === token) {
      this.success(req,res,{email});
    } else {
      this.fail(req,res);
    }
  }
  extractInfo = profile => ({
    userId: profile.email,
    username: profile.email.split('@')[0],
    email: profile.email
  })
  createToken = async (email) => {
    const token = engine.utils.randomString();
    this.store.set(email, token);
    return token;
  }
  sendLink = async (email) => {
    const token = await this.createToken(email);
    const url = engine.fullUrlFor('/_auth/'+this.name, { email, token });

    await this.email.send({
      from: 'no-reply@ljudmila.org',
      to: email,
      subject: 'login link',
      text: "here's a link for you " + url
    })
  }
  service = {
    ... this.service,
    sendLink: this.sendLink
  }
}