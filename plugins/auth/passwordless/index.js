exports.Plugin = engine => class AuthPasswordless extends engine.Plugin.Auth {
  constructor(engine, { email, store, ...rest }) {
    super(engine, rest);
    this.store = engine.getOrCreateService(store);
    this.email = engine.getOrCreateService(email);
    this.setupRoutes();
  }

  authenticate = async (req,res) => {
    const { email } = req.params;
    const { token } = req.query;
    const stored = await this.store.get(email);
    if (stored === token) {
      this.success(req,res,{email});
    } else {
      this.fail(req,res);
    }
  }

  setupRoutes() {
    engine.addRoute('get','/_auth/'+this.name+'/:email',this.authenticate);
  }
  send = async (email) => {
    const token = engine.utils.randomString();
    this.store.set(email, token);
    const url = engine.fullUrlFor('/_auth/'+this.name+'/:email', { email, token });

    await this.email.send({
      from: 'no-reply@ljudmila.org',
      to: email,
      subject: 'login link',
      text: "here's a link for you " + url
    })
  }
  service = {
    ... this.service,
    send: this.send
  }
}