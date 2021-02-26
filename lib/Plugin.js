const {randomString} = require("./utils");

const Plugin = exports.Plugin = class Plugin {
  constructor(engine, {...rest}) {
    Object.assign(this,{
      engine,
    })
  }
  static register(engine,name,conf) {
    const service = new this(engine,conf);
    return service;
  }
}

Plugin.Auth = class PluginAuth extends Plugin {
  static register(engine,name,conf) {
    const service = super.register(engine,name,conf);
    engine.auth.push(service);
    return service;
  }

  async authenticate(req) {
    return false;
  }
}

Plugin.Auth.Password = class PluginAuthPassword extends Plugin.Auth {
  constructor(engine, {userField="username",passField="password",...rest}) {
    super(engine, rest);
    Object.assign(this,{
      userField,
      passField
    })
  }
  async authenticate(req) {
    const {
      [this.userField]:username,
      [this.passField]:password,
    } = req.body;
    if (await this.checkPassword(username,password)) {
      return username;
    }
  }
  async checkPassword(username,password) {
    return false;
  }
}

const PluginStore = Plugin.Store = class PluginStore extends Plugin {
  async get(key) {
    return undefined;
  }
  async set(key,val) {
    return val;
  }
  async has(key) {
    return false;
  }
  async delete(key) {
    if (!this.has(key)) return false;
    const val = await this.get(key);
    await this._delete(key);
    return val;
  }

  async clear() {
    return undefined;
  }

  async insert(key,val) {
    if (arguments.length === 0) {
      val = key;
      key = randomString();
    }
    if (await this.has(key)) throw new Error("Duplicate key " + key);
    return await this.set(key,val)
  }
  async _update(key,val) {
    return await this.set(key,Object.assign(this.get(key),val));
  }
  async update(key,val) {
    if (!await this.has(key)) throw new Error("Missing key for update " + key);
    return await this._update(key,val);
  }
  async upsert(key,val) {
    if (await this.has(key)) return await this.update(key,val);
    return await this.insert(key);
  }
  async keys() {
    return [];
  }
  async _values() {
    const keys = await this.keys();
    return keys.map(async key=> await this.get(key));
  }
  async values() {
    return await this._values();
  }
  async entries() {
    return await this._entries();
  }
  async _entries() {
    const keys = await this.keys();
    return keys.map(async key=> [key,await this.get(key)]);
  }
  async find(query) {
    const ret = [];
    outer: for (const [key,value] of await this.entries()) {
      for(const i in query) {
        if(value[i]!==query[i]) break outer;
      }
      ret.push([key,value])
    }
    return ret;
  }
  async findOne(query) {
    const ret = [];
    outer: for (const [key,value] of await this.entries()) {
      for(const i in query) {
        if(value[i]!==query[i]) break outer;
      }
      return [key,value]
    }
  }
}

const PluginStoreMap = Plugin.Store.Map = class PluginStoreMap extends Plugin.Store {
  constructor(engine, { map, ...rest }) {
    super(engine, rest);
    this.map = map;
  }
  get(key) {
    return this.map.get(key);
  }
  set(key,val) {
    return this.map.set(key,val);
  }
  has(key) {
    return this.map.has(key);
  }
  delete(key) {
    return this.map.delete(key);
  }
  entries() {
    return this.map.entries ? this.map.entries() : super.entries();
  }
  keys() {
    return this.map.keys();
  }
  values() {
    return this.map.values ? this.map.values() : super.values();
  }
  clear() {
    return this.map.clear();
  }
}