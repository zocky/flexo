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

  static _findFilesRecursive = (dir, ext = [], from = dir) => {
    if (!fs.existsSync(dir)) return [];
    ext = [].concat(ext);
    var ret = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const it of entries) {
      if (it.isFile()) {
        const absolute = Path.resolve(dir, it.name),
          relativePath = Path.relative(from, absolute),
          parsed = Path.parse(absolute),
          relativeName = Path.relative(from, Path.resolve(dir, parsed.name)),
          ext = parsed.ext;
        ret.push({
          name: it.name,
          path: absolute,
          relativePath,
          relativeName,
          ext
        });
      }
      if (it.isDirectory()) {
        ret = [...ret, ...this._findFilesRecursive(Path.resolve(dir, it.name), ext, dir)]
      }
    }
    return ret;
  }
  static findFilesRecursive = (dir, ext = []) => {
    const spec = {
      config: ['.json','.yaml']
    }

    const groups = {};
    const files = this._findFilesRecursive("./config", ext = [])
    const ret = [];
    for (const file of files) {
      const name = file.relativeName.replace(/--/g,'/');
      const group = groups[name] = groups[name] || {};
      group[file.ext] = file;
    }
    for (const name in groups) {
      const group = groups[name];
      const module = { name };
      for (const id in spec) {
        for (const ext of spec[id]) {
          const file = group[ext];
          if (file) {
            module[id] = {
              path:file.path,
              ext:file.ext
            };
            break;
          }
        }
      }
      ret.push(module);
    }
    return ret;
  }
}