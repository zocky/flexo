const { Base } = require("../Base");

exports.PluginBase = class PluginBase extends Base {
  /**
   * Defines the service that will be available to other services
   * 
   * Use service = { ... this.service, myProp1, myProp2 } to extend
   * the superclass's service
   */

  service = {
    on: this.on,
  };

  /**
   * 
   * @param {Engine} engine  
   * @param {object} conf
   */
  constructor(engine, { name, id, ...rest }) {
    super();
    Object.assign(this, {
      engine,
      name,
      id
    })
  }
  /**
   * Called after all configured services have been loaded, so they can be referenced by id
   *  
   */

  setup() { };

  static setup(instance) {
    instance.setup();
  }


  static provideService(instance) {
    let service = {};
    for (const key in instance.service) {
      let value = instance.service[key];
      service[key] = typeof value === 'function' ? value.bind(instance) : value;
    }
    service.settings = instance.settings;
    return service;
  }
  settings = {};

  static create(engine, conf = {}) {
    conf = { ...conf };
    const settings = {};
    const it = new this(engine, conf);
    it.conf = conf;
    for (const id in it.settings) {
      let val = it.settings[id];
      if (typeof val === "function") val = val.call(it, it.conf[id],it);
      settings[id] = val;
    }
    it.settings = settings;
    return it;
  }

}

