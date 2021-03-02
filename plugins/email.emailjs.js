const { Plugin } = require("../lib/Plugin")


exports.Plugin = class EmailEmailJS extends Plugin {

  service = {
    ... this.service,
    send: this.send
  }

  settings = {
    ...this.settings,
    user: String,
    password: String,
    host: String,
    ssl: Boolean,
    tls: Boolean,
    timeout: parseInt,
    domain: String,
    authentication: Object,
    options: (val,{
      user, password, host, ssl, tls, timeout, domain, authentication
    }) => ({
      user, password, host, ssl, tls, timeout, domain, authentication
    })
  }
  setup() {
    super.setup();
    const { SMTPClient } = require('emailjs');
    this.client = new SMTPClient(this.settings);
  }

  send(message) {
    return new Promise((resolve, reject) => {
      this.client.send(message, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
    })
  }
}
