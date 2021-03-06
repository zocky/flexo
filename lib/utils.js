const fs = require("fs");
const Path = require("path");
const qs = require("querystring");
const Crypto = require('crypto');
const yaml = require('yaml');


module.exports = new class {
  AsyncFunction = (async()=>{}).constructor;
  isAsync(fn) {
    return fn.constructor === this.AsyncFunction
  }
  asyncMiddleware
    = fn => {
      if (!this.isAsync(fn)) {
        return fn;
      }
      return async (req, res, next) => {
      try {
        await fn(req, res);
        next();
      } catch (error) {
        console.log(error);
        next(error);
      }
    };
  }

  urlFor = (path, props) => {
    const restProps = Object.assign({}, props);
    let pathDone = false;
    let url = "/" + path.split("/").map(part => {
      if (pathDone) return null;
      if (part[0] !== ":") return part;
      let name = part.substr(1);
      if (part.substr(-1) == "?") {
        name = name.substr(0, -1);
        if (!(name in restProps)) {
          pathDone = true;
          return null;
        }
      }
      const val = restProps[name]
      delete restProps[name];
      return val;
    }).filter(Boolean).join("/");

    const query = qs.stringify(restProps);
    if (!query) return url;
    return url + "?" + query;
  }
  urlResolve = (from, to) => {
    return new URL(to, from).href;
  }

  toArray = (def, arg, ...args) => {
    arg = this.toValue(undefined, arg, ...args);
    if (arg === undefined) {
      return def;
    }
    return [].concat(arg);
  }

  toFunction(def, arg, ...args) {
    if (typeof arg === "undefined") return () => def;
    if (typeof arg === "function") return function (...my) {
      return arg.call(this, ...args, ...my);
    }
    return () => arg;
  }

  toValue = (def, arg, ...args) => {
    if (typeof arg === "function") arg = arg(...args);
    if (typeof arg === "undefined") return def;
    return arg;
  }

  randomString = (size) => {
    const { randomInt } = Crypto;
    return randomInt(1E14).toString(36) + '-' + randomInt(1E14).toString(36);
  }


  findModules(dir, ext = []) {
    ext = [].concat(ext);
    const names = {};
    fs.readdirSync(dir, { withFileTypes: true })
      .filter(it => it.isFile())
      .map(it => Path.parse(it.name))
      .filter(it => !ext || ext.includes(it.ext))
      .forEach(it => names[it.name] = true);
    return Object.keys(names);
  }

  findFiles(dir, ext = []) {
    if (!fs.existsSync(dir)) return [];
    ext = [].concat(ext);
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter(it => it.isFile())
      .map(it => Path.parse(it.name))
      .filter(it => !ext || ext.includes(it.ext))
      .map(it=>{
        it.path = Path.resolve(dir,it.base);
        return it;
      })
  }

  _findFilesRecursive = (dir, ext = [], from = dir) => {
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
  findFilesRecursive = (dir, ext = []) => {
    const spec = {
      config: ['.json', '.yaml']
    }

    const groups = {};
    const files = this._findFilesRecursive("./config", ext = [])
    const ret = [];
    for (const file of files) {
      const name = file.relativeName.replace(/--/g, '/');
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
              path: file.path,
              ext: file.ext
            };
            break;
          }
        }
      }
      ret.push(module);
    }
    return ret;
  }

  deferred = () => {
    let resolve, reject;
    let promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject }
  }

  DeferredPromise = class DeferredPromise {
    constructor() {
      this._promise = new Promise((resolve, reject) => {
        // assign the resolve and reject functions to `this`
        // making them usable on the class instance
        this.resolve = resolve;
        this.reject = reject;
      });
      // bind `then` and `catch` to implement the same interface as Promise
      this.then = this._promise.then.bind(this._promise);
      this.catch = this._promise.catch.bind(this._promise);
      this[Symbol.toStringTag] = 'Promise';
    }
  }
  defer = fn => {
    const deferred = new this.DeferredPromise();
    if (fn) return deferred.then(fn);
    else return deferred;
  }
  loadConfigFileWithInclusion(path,included=[]) {
    this.assert(!included.includes(path),"Inclusion cycle in conf");
    included.push(path);
    const dir = Path.parse(path).dir;
    const ownConf = this.loadConfigFile(path);
    let conf = {};
    if (Array.isArray(ownConf.$include)) {
      for (const include of ownConf.$include) {
        const includePath = Path.resolve(dir,include);
        const includeConf = this.loadConfigFileWithInclusion(includePath,included);
        conf = this.merge(conf,includeConf);
      }
    }
    conf = this.merge(conf,ownConf);
    return conf;
  }
  loadConfigFile(path) {
    if (path.endsWith('.yaml')) {
      return yaml.parse(fs.readFileSync(path, "utf-8"));
    } else if (path.endsWith('.json')) {
      return require(path);
    } else {
      this.throw("bad config file",path)
    }
  }
  merge = require("merge-deep")
  assert = (test,...args) => {
    if (!test) this.throw(...args);
  }
  throw = (...args) => {
    throw new Error(...args);
  }
  debug = (...args) => {
    const orig = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;
    const err = new Error();
    Error.captureStackTrace(err, global);
    const callee = err.stack[1];
    Error.prepareStackTrace = orig;
    if (!callee) return console.log(...args);
    const callerFile = Path.relative(process.cwd(), callee.getFileName());
    const callerLine = callee.getLineNumber();
    console.log(`[${callerFile} : ${callerLine}]`,...args);
  }
  default = def => val => val === undefined ? def : val;
  fileExists = fs.existsSync
}

