
const yaml = require('yaml');
const fs = require("fs");
const Path = require("path");

const less = require("less");

const pluginDirectory = Path.resolve(__dirname,"../plugins");

const { Template } = require("./Template");
const { Page } = require("./Page");
const { Plugin } = require("./Plugin");
const { parse } = require("../parser");

const { randomString, findFiles, findModules } = require("./utils");

const express = require("express");

const DEVEL = true;

module.exports.Engine = class Engine {
  static Template = Template;
  static Page = Page;
  static Plugin = Plugin;

  static start(config) {
    const flexo = new this(config);
    flexo.start();
  }
  start() {
    const app = this.app = express();
    const messages = [];
    app.use(this.router);

    if (DEVEL) {
      const token = randomString();
      messages.push("http://localhost:3000/"+token)
      this.router.get("/"+token, (req, res) => {
        this.login(res, 'root');
      });
    }

    app.listen(this.config.port, () => {
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


  templates = {};
  layouts = {};
  helpers = {};
  pages = {};
  styles = {};

  constructor(config) {
    this.config = this.getConfig(config);

    console.log('\n== STARTING FLEXO ==')
    this.setupRouter();
    this.load();
  }
  setupRouter() {
    this.router = express.Router();
    this.router.use(require('cookie-parser')(this.config._jwtSecret));
    this.router.use(express.urlencoded({extended:true}));
    this.router.use(express.json());


    this.router.use((req, res, next) => {
      const userId = req.signedCookies._flexo_login;
      const user = this.config.getUser()
      if (user) {
        req.userId = userId;
        req.user = user;
      }
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
    this.loadPlugin("auth/htpasswd")
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


  loadPlugin(path, conf = null) {
    const pluginPath = Path.resolve(pluginDirectory,path);
    const configPath = Path.resolve(this.config.configDirectory,"plugin-"+path.replace(/[/]/g,"-"));
    console.log(pluginPath,configPath);
    let config = {};
    if (fs.existsSync(configPath+".json")) {
      config = require(configPath+".json");
    } else if (fs.existsSync(configPath+".yaml")) {
      config = yaml.parse(fs.readFileSync(configPath+".yaml","utf-8")) || {};
    } else {
      console.log("no config found")
    }
    console.log('config',config)
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

  getConfig({
    auth: {
      verifyUser = () => false,
      getUser = userId => null
    } = {}
  } = {}) {
    const
      _jwtSecret = process.env.JWT_SECRET || 'flexo-secret',
      port = process.env.PORT || 3000,
      rootDirectory = process.env.FLEXO_ROOT || Path.resolve("."),
      configDirectory = process.env.FLEXO_CONFIG || Path.join(rootDirectory, "config"),
      viewsDirectory = process.env.FLEXO_VIEWS || Path.join(rootDirectory, "views"),
      publicDirectory = process.env.FLEXO_PUBLIC || Path.join(rootDirectory, "public"),
      pagesDirectory = Path.join(viewsDirectory, "pages"),
      templatesDirectory = Path.join(viewsDirectory, "templates"),
      layoutsDirectory = Path.join(viewsDirectory, "layouts"),
      helpersDirectory = Path.join(viewsDirectory, "helpers"),
      stylesDirectory = Path.join(rootDirectory, "styles"),
      defaultLayout = "main"

    return {
      _jwtSecret,
      verifyUser,
      getUser,
      port,
      rootDirectory,
      publicDirectory,
      viewsDirectory,
      pagesDirectory,
      templatesDirectory,
      layoutsDirectory,
      helpersDirectory,
      stylesDirectory,
      defaultLayout,
      configDirectory
    }
  }

  registerHelpers(helpers) {
    Object.assign(this.helpers, helpers);
  }
}

