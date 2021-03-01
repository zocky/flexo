const { Plugin } = require("../lib/Plugin")


exports.Plugin = class AuthPasswordless extends Plugin.Auth {
  setup() {
    super.setup();
    this.store = this.engine.getOrCreateService(this.conf.store);
    this.email = this.engine.getOrCreateService(this.conf.email);
  }

  service = {
    ...this.service,
    sendLink: this.sendLink
  }

  authenticate = async (req, res) => {
    const { token, email } = req.query;
    console.log('auth', email, token)
    const stored = await this.store.get(email);
    if (stored === token) {
      this.success(req, res, { email });
    } else {
      this.fail(req, res);
    }
  }
  extractInfo = profile => ({
    userId: profile.email,
    username: profile.email.split('@')[0],
    email: profile.email
  })
  createToken = async (email) => {
    const token = this.engine.utils.randomString();
    console.log(this.store);
    this.store.set(email, token);
    return token;
  }
  async sendLink (email) {
    const token = await this.createToken(email);
    const url = this.engine.fullUrlFor('/_auth/' + this.name, { email, token });

    await this.email.send({
      from: 'no-reply@ljudmila.org',
      to: email,
      subject: 'login link',
      text: "here's a link for you " + url
    })
  }
}