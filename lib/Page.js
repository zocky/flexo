const qs = require("querystring");

const { asyncMiddleware, urlFor, toArray, toFunction } = require("./utils");
const { Template } = require("./Template");

exports.Page = class Page {
  props = {};
  status = 200;
  body = "";
  contentType = "text/html";

  get layout() {
    return this.engine.config.defaultLayout;
  }

  constructor(req, res) {
    this.engine = this.constructor.engine;
    this.req = req;
    this.res = res;
    const body = typeof req.body === 'object' ? { ...req.body, body: req.body } : { body: req.body }
    this.props = Object.assign({}, req.query, body, req.params);
  }

  static register(engine, { template }) {
    this.engine = engine;
    this.redirectFrom = toArray([], this.redirectFrom);
    this.template = new Template(this.engine, { template, helpers: this.helpers || {} }).render;

    
    if (this.route) {
      console.log(this.route);
      engine.router.all(this.route, this.middleware());

      const mw = this.redirectMiddleware();
      for (const redirect of this.redirectFrom) {
        engine.router.all(redirect, mw);
      }
    }
    return this;
  }

  static before = [];

  static middleware() {
    return [].concat(this.before,
      asyncMiddleware(async (req, res) => {
        console.log(`[${req.userId||'(none)'}] ${req.method} ${req.url}`);
        const page = new this(req, res);
        return await page.serve();
      })
    );
  }

  static redirectMiddleware() {
    return (req, res) => {
      const props = { ...req.query, ...req.params };
      const url = this.urlFor(props);
      if (!url) next(404);
      res.redirect(url);
    };
  }

  static urlFor(props) {
    return urlFor(this.route, props);
  }


  async serve() {
    const method = this.req.method;
    if (!this[method]) {
      this.res.status(404).send("not found");
      return;
    }
    this.userId = this.req.userId;
    const ret = await this[method](this.props, this);
    if (ret === undefined) return;
    this.res
      .status(this.status)
      .header("content-type", this.contentType)
      .send(ret);
  }

  async data(props=this.props) {
    return { ...props };
  }

  async output(props=this.props) {
    const data = await this.data(props);
    this.body = await this.render(data);
    if (this.layout) {
      if (this.contentType == "text/html") {
        const layout = this.layout;
        this.body = await this.engine.layout(layout, this);
        
      }
    }
    return this.body;
  }

  async render(data) {
    return await this.constructor.template(data);
  }

  async GET(props) {
    return await this.output(props);
  }

  redirect(props) {
    return this.res.redirect(this.urlFor(props))
  }
  redirectTo(page,props) {
    return this.res.redirect(this.engine.urlFor(page,props))
  }
}