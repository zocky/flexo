const { Plugin } = require("../lib/Plugin")


exports.Plugin = class EmailEmailJS extends Plugin {
  static requires = ['emailjs'];
  constructor(engine, {
    user,
    password,
    host,
    ssl,
    tls,
    timeout,
    domain,
    authentication,
    ...rest
  }) {
    super(engine, rest);

    const options = { user, password, host, ssl, tls, timeout, domain, authentication };
    for (const i in options) if (options[i] === undefined) delete options[i];

    const { SMTPClient } = require('emailjs');
    this.client = new SMTPClient(options);
  }
  hasService = true;
  service = {
    ... this.service,
    send: (message) => {
      return new Promise((resolve, reject) => {
        this.client.send(message, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        })
      })
    }
  }
}
