
const yaml = require('yaml');
const fs = require("fs");
const Path = require("path");
const merge = require("merge-deep");
const less = require("less");

const pluginDirectory = Path.resolve(__dirname, "../plugins");

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

module.exports.Engine = class Engine {
  static Template = Template;
  static Page = Page;
  static Plugin = Plugin;
  Plugin = Plugin;
  Template = Template;
  Page = Page;

  static start(config) {
    const flexo = new this(config);
    flexo.start();
    return flexo;
    console.log(flexo.config);
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
      const {key,cert} = this.config.https;
      if (!key || !cert) throw "bad https config"
      let options = {
        key: fs.readFileSync(Path.resolve(this.config.rootDirectory,key),'utf-8'),
        cert: fs.readFileSync(Path.resolve(this.config.rootDirectory,cert),'utf-8'),
      };
      server = https.createServer(options,app);
    } else {
      server = https.createServer({},app);
    }

    server.listen(this.config.port, () => {
      console.log("Flexo listening at port " + this.config.port);
      for (const msg of messages) {
        console.log(msg)
      }
    });
    return this;
  }

  login = (res, id, redirect = "/") => {
    res.cookie('_flexo_login', id, { signed: true });
    if (redirect) res.redirect(redirect);
  }

  logout = (res, redirect = "/") => {
    res.clearCookie('_flexo_login');
    if (redirect) res.redirect(redirect);
  }

  auth = [];
  templates = {};
  layouts = {};
  helpers = {};
  pages = {};
  styles = {};
  plugins = {};
  services = {};

  constructor(config) {
    this.config = this.getConfig(config);

    console.log('\n== STARTING FLEXO ==')
    this.setupRouter();
    this.load();
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

    this.router.use(express.static(this.config.publicDirectory));


    this.router.get('/_wait', () => { })
    this.router.get('/logout', (req, res) => this.logout(res));


    this.router.get('/styles/:style', async (req, res, next) => {
      const style = this.styles[req.params.style];
      if (!style) {
        res.status(404);
        return next();
      }
      if (!("cache" in style)) {
        let source = fs.readFileSync(style.path, "utf-8");
        if (style.ext === ".less") {
          const res = (await less.render(source, {
            filename: style.path
          }))
          style.cache = res.css;
        } else {
          style.cache = source;
        }
      }
      res.contentType("text/css");
      res.send(style.cache);
    });

    for (const name in this.pages) {
      const page = this.pages[name];
    }
  }
  urlFor(name, props) {
    const page = this.pages[name];
    if (!page || !page.route) {
      return null;
    }
    return page.urlFor(props);
  }


  load() {
    for (const service of this.config.services) {
      console.log('registering',service.name)
      this.registerService(service);
    }
    this.loadHelpers();
    this.loadStyles();
    this.loadTemplates();
    this.loadLayouts();
    this.loadPages();
  }
  loadHelpers() {
    const { helpersDirectory } = this.config;
    let names = findModules(helpersDirectory, [".js"]);
    for (const name of names) {
      const helperFile = Path.resolve(helpersDirectory, name + ".js");
      console.log(helperFile);
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


  loadPlugin(path) {
    if (!this.plugins[path]) {

      const pluginPath = Path.resolve(pluginDirectory, path);
      this.plugins[path] = require(pluginPath).Plugin(this);
    }
    return this.plugins[path];
  }

  loadService(conf) {
    const Plugin = this.loadPlugin(conf.plugin);
    return new Plugin(this,conf)
  }

  registerService(conf) {
    const Plugin = this.loadPlugin(conf.plugin);
    this.services[conf.name] = Plugin.register(this,conf.name,conf)
  }
  

  loadStyles() {
    const dir = this.config.stylesDirectory;
    const files = findFiles(dir, ['.less', '.css']);
    for (const file of files) {
      this.styles[file.base] = {
        path: Path.resolve(dir, file.base),
        ext: file.ext
      }
    }
    //console.log(this.styles);
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
    if (fs.existsSync(moduleFile)) {
      proto = require(moduleFile);
    }
    //console.log('Loading',klass.name,Path.resolve(dir,name))
    proto.id = name;
    if (fs.existsSync(templateFile)) {
      let source = fs.readFileSync(templateFile, "utf8");
      try {
        proto.template = parse(source);
      } catch (e) {
        console.log(String(e.message));
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

  getConfig(config) {
    const rootDirectory = process.env.FLEXO_ROOT || Path.resolve(".");
    const configDirectory = Path.resolve(rootDirectory, process.env.FLEXO_CONFIG || "config");
    let fileConfig = {};
    let file = Path.resolve(configDirectory, process.env.FLEXO_CONFIG_FILE || "flexo.yaml");
    if (fs.existsSync(file)) {
      fileConfig = yaml.parse(fs.readFileSync(file, "utf-8"));
    } else {
      file = Path.resolve(configDirectory, process.env.FLEXO_CONFIG_FILE || "flexo.json");
      if (fs.existsSync(file)) {
        fileConfig = require(file);
      } else {
        fileConfig = {};
      }
    }
    config = merge(fileConfig, config);
    if (typeof config != "object") config = {};
    return Config(config);
  }
}
