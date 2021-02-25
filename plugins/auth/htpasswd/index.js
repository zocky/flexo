//const AuthPassword = require("../AuthPassword");

//const htpasswd = require('htpasswd-js');

exports.Plugin = engine => class AuthHtpasswd extends engine.Plugin.Auth.Password {
  constructor(engine,{file,...rest}) {
    this.file = file;
  }
  async checkPassword(username,password) {
    return username===password;
  }
}