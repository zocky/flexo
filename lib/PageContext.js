exports.PageContext = class {
  props = {};
  data = {};
  status = 200;
  body = "";

  constructor(page, req, res) {
    this.page = page;
    this.engine = page.engine;
    this.req = req;
    this.res = res;

    const body = typeof req.body === 'object' ? { ...req.body, body: req.body } : { body: req.body }
    const props = { ...req.qery, ...body, ...req.params };
    this.props = props;
  }

  async serve() {

  }

  static async serve() {

  }
}