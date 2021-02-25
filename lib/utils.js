const fs = require("fs");
const Path = require("path");
const qs = require("querystring");
const Crypto = require('crypto')

module.exports = class {
  static asyncMiddleware
    = fn => async (req, res, next) => {
      try {
        await fn(req, res);
        next();
      } catch (error) {
        console.log(error);
        next(error);
      }
    };

  static urlFor = (path, props) => {
    const restProps = Object.assign({}, props);
    path = path.replace(/(^|[/]):([^/]+)/g, ($, $1, $2) => {
      if (!($2 in restProps)) {
        return null
      }
      delete restProps[$2];
      return $1 + props[$2];
    });
    const query = qs.stringify(restProps);
    if (!query) return path;
    return path + "?" + query;
  }

  static toArray = (def, arg, ...args) => {
    arg = this.toValue(undefined, arg, ...args);
    if (arg === undefined) {
      return def;
    }
    return [].concat(arg);
  }

  static toFunction(def, arg, ...args) {
    if (typeof arg === "undefined") return () => def;
    if (typeof arg === "function") return function (...my) {
      return arg.call(this, ...args, ...my);
    }
    return () => arg;
  }

  static toValue = (def, arg, ...args) => {
    if (typeof arg === "function") arg = arg(...args);
    if (typeof arg === "undefined") return def;
    return arg;
  }

  static randomString = (size = 21) => Crypto.randomBytes(size).toString('base64').slice(0, size);


  static findModules(dir, ext = []) {
    ext = [].concat(ext);
    const names = {};
    fs.readdirSync(dir, { withFileTypes: true })
      .filter(it => it.isFile())
      .map(it => Path.parse(it.name))
      .filter(it => !ext || ext.includes(it.ext))
      .forEach(it => names[it.name] = true);
    return Object.keys(names);
  }

  static findFiles(dir, ext = []) {
    if (!fs.existsSync(dir)) return [];
    ext = [].concat(ext);
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter(it => it.isFile())
      .map(it => Path.parse(it.name))
      .filter(it => !ext || ext.includes(it.ext))
  }

}