
const fs = require("fs");
const Path = require("path");
const less = require("less");

const pluginDirectory = Path.resolve(__dirname, "../plugins");

const { Base } = require("./Base");

const { Template } = require("./Template");
const { Config } = require("./Config");
const { Page } = require("./Page");
const { Plugin } = require("./Plugin");
const { parse } = require("../parser");

const { randomString, findFiles, findModules, findFilesRecursive } = require("./utils");
const cookieSession = require('cookie-session')
const express = require("express");
const { deepStrictEqual } = require('assert');
const http = require("http");
const https = require("https");
const DEVEL = true;

module.exports.Engine = class Engine extends Base {
  static Template = Template;
  static Page = Page;
  static Plugin = Plugin;
  utils = require("./utils");
  Plugin = Plugin;
  Template = Template;
  Page = Page;

  static start(config) {
    const flexo = new this(config);
    flexo.start();
    return flexo;
    this.debug(flexo.config);
  }
  stop() {
    this.server.close();
  }
  start() {
    const app = this.app = express();
    /*app.use(cookieSession({
      name:"session", 
      keys:["superdupersecret"]
    }));*/
    const messages = [];
    app.use(this.router);

    if (DEVEL) {
      const token = randomString();
      messages.push("root login: http://localhost:" + this.config.port + "/" + token)
      this.router.get("/" + token, (req, res) => {
        this.login(res, 'root');
      });
    }
    var server;
    if (this.config.https) {
      const { key, cert } = this.config.https;
      if (!key || !cert) throw "bad https config"
      let options = {
        key: fs.readFileSync(Path.resolve(this.config.rootDirectory, key), 'utf-8'),
        cert: fs.readFileSync(Path.resolve(this.config.rootDirectory, cert), 'utf-8'),
      };
      this.server = https.createServer(options, app);
      this.rootUrl = 'https://' + this.config.rootUrl
    } else {
      this.server = https.createServer({}, app);
      this.rootUrl = 'http://' + this.config.rootUrl
    }

    this.server.listen(this.config.port, () => {
      this.debug("Flexo listening at port " + this.config.port);
      for (const msg of messages) {
        this.debug(msg)
      }
    });
    return this;
  }

  login = (res, id, redirect = "/") => {
    res.cookie('_flexo_login', id, { signed: true });
    if (redirect) res.redirect(redirect);
  }

  logout = (res, redirect = "/login") => {
    res.clearCookie('_flexo_login');
    if (redirect) res.redirect(redirect);
  }


  constructor(...config) {
    super();
    this.config = this.loadConfig('config/flexo.yaml');

    this.debug('\n== STARTING FLEXO ==')
    this.setupRouter();
    this.load();
  }

  setupHotReload() {
    this.router.get('/_wait', () => { })
    this.router.get('/_ready', (req, res) => { res.json("OK") });
    this.router.get('/_hotreload.js', (req, res) => {
      res.contentType('text/javascript');
      res.send(
        `(async () => {
  try {
    let res = await fetch("/_wait");
    let body = await res.json();
    location.reload();
  } catch (error) {
    location.reload();
  }
})();`
      )
    })
  }
  routerUseAt(url,fn) {
    this.router.use(url,this.utils.asyncMiddleware(fn));
  }
  routerUse(fn) {
    this.router.use(this.utils.asyncMiddleware(fn));
  }
  setupRouter() {
    this.router = express.Router();
    this.router.use(require('cookie-parser')("flexo-secret"));
    this.router.use(express.urlencoded({ extended: true }));
    this.router.use(express.json());


    this.router.use((req, res, next) => {
      const userId = req.signedCookies._flexo_login;
      req.userId = userId;
      next();
    })

    if (DEVEL) this.setupHotReload();


    this.router.get('/logout', (req, res) => this.logout(res));

  

    for (const name in this.pages) {
      const page = this.pages[name];
    }
  }

  addRoute(method, path, cb) {
    console.log('ROUTE', { method, path })
    this.router[method](path, cb);
  }

  load() {
    this.loadServices()
    this.loadHelpers();
    this.loadTemplates();
    this.loadLayouts();
    this.loadPages();
  }

  /**
   * PLUGINS AND SERVICES
   */

  /**
   * 
   * @param {String} path relative path in the flexo/plugins directory
   */

  plugins = {};
  services = {};

  _services_to_setup = [];
  _services_loaded = false;

  loadServices() {
    for (const id in this.config.services) {
      const conf = this.config.services[id];
      if (conf.debug) this.debug('registering', id,conf)
      this.loadService(id, conf);
    }
    for (const instance of this._services_to_setup) {
      this.debug('setting up',instance.id,instance.name,instance.conf.plugin,Object.getPrototypeOf(instance.constructor).name);
      instance.constructor.setup(instance);
    }
    this._services_loaded = true;
  }

  loadPlugin(path) {
    if (!this.plugins[path]) {
      const pluginPath = Path.resolve(pluginDirectory, path);
      this.plugins[path] = require(pluginPath).Plugin;
    }
    return this.plugins[path];
  }

  resolvePath = (path) => {
    return Path.resolve(this.config.rootDirectory,path)
  }
  resolveDataPath = (path) => {
    return Path.resolve(this.config.dataDirectory,path)
  }
  
  makeService(conf, loadId) {
    const Plugin = this.loadPlugin(conf.plugin);
    let id = conf.id || loadId;
    let name = conf.name || id || null;
    const instance = Plugin.create(this, { ...conf, name, id });
    let service = Plugin.provideService(instance);
    service.id = instance.id = id;
    service.name = instance.name = name;
    service.Plugin = instance.Plugin = Plugin;

    if (this._services_loaded) {
      nstance.constructor.setup(instance);
    } else {
      this._services_to_setup.push(instance);
    }
    if (id!=loadId) {
      if (this.services[id]) {
        throw new Error("duplicate service id",id);
      }
      this.services[id]=service;
    }
    return service;
  }

  getOrCreateService(conf) {
    if (typeof conf == "string") return this.services[conf];
    if (conf.name) return this.loadService(conf.name, conf);
    else return this.makeService(conf);
  }

  loadService(id, conf) {
    const service = this.makeService(conf, id);
    if (this.services[id]) {
      throw new Error("duplicate service id",id);
    }
    this.services[id] = service;
  }

  /** 
  * VIEWS
  */
  templates = {};
  layouts = {};
  helpers = {};
  pages = {};

  urlFor(route, props) {
    return this.utils.urlFor(route, props);
  }
  fullUrlFor(route, props) {
    return this.utils.urlResolve(this.rootUrl, this.utils.urlFor(route, props));
  }

  urlForPage(name, props) {
    const page = this.pages[name];
    if (!page || !page.route) {
      return null;
    }
    return page.urlFor(props);
  }


  loadHelpers() {
    const { helpersDirectory } = this.config;
    let names = findModules(helpersDirectory, [".js"]);
    for (const name of names) {
      const helperFile = Path.resolve(helpersDirectory, name + ".js");
      this.debug(helperFile);
      this.registerHelpers(require(helperFile));
    }
  }
  loadTemplates() {
    this.templates = this.loadModules(this.config.templatesDirectory, Template)
  }
  loadLayouts() {
    this.layouts = this.loadModules(this.config.layoutsDirectory, Template)
  }
  loadPages() {
    this.pages = this.loadModules(this.config.pagesDirectory, Page);
  }





  loadModules(dir, klass) {
    let names = findModules(dir, [".flexo", ".js"]);
    let ret = {};
    for (const name of names) {
      const module = this.loadModule(dir, name, klass);
      ret[name] = module;
    }
    return ret;
  }

  loadModule(dir, name, klass = Template) {
    let moduleFile = Path.resolve(dir, name + '.js');
    let templateFile = Path.resolve(dir, name + '.flexo');
    if (!moduleFile && !templateFile) return null;
    let proto = {}, render = () => "not implemented";
    if (this.utils.fileExists(moduleFile)) {
      proto = require(moduleFile);
    }
    //this.debug('Loading',klass.name,Path.resolve(dir,name))
    proto.id = name;
    if (this.utils.fileExists(templateFile)) {
      let source = fs.readFileSync(templateFile, "utf8");
      try {
        proto.template = parse(source);
      } catch (e) {
        this.debug(String(e.message));
        proto.render = () => "❌ [" + templateFile.substr(dir.length + 1) + " " + e.location.start.line + ":" + e.location.start.column + "] " + e.message + " ❌";
      }
    }
    if (typeof proto === 'object') return klass.register(this, proto);
    else {
      return proto.register(this, { template: proto.template });
    }
  }

  async render(name, props) {
    return await this.templates[name].render(props);
  }
  async layout(name, props) {
    return await this.layouts[name].render(props);
  }

  registerHelpers(helpers) {
    Object.assign(this.helpers, helpers);
  }

  loadConfig(config) {
    if (typeof config==='string') config = this.utils.loadConfigFileWithInclusion(Path.resolve(".",config));
    return Config(config);
  }
}
