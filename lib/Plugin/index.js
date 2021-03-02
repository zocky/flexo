const Plugin = exports.Plugin = require("./PluginBase").PluginBase;

Plugin.Auth = require("./PluginAuth").PluginAuth;
Plugin.Auth.Passport = require("./PluginAuthPassport").PluginAuthPassport;
Plugin.Auth.Password = require("./PluginAuthPassword").PluginAuthPassword;
Plugin.Store = require("./PluginStore").PluginStore;
Plugin.Store.Feathers = require("./PluginStoreFeathers").PluginStoreFeathers;
Plugin.Store.Key = require("./PluginStoreKey").PluginStoreKey;
Plugin.Store.Map = require("./PluginStoreMap").PluginStoreMap;
/*
1
const Plugin = exports.Plugin = class Plugin {
  constructor(engine, { name, ...rest }) {
    Object.assign(this, {
      engine,
      name
    })
  }
  handlers = {};
  on = (event, handler) => {
    this.handlers[event] = this.handlers[event] || [];
    this.handlers[event].push(handler);
  }
  async trigger(event, ...args) {
    const handlers = this.handlers[event] || [];
    for (const handler of handlers) {
      await handler.call(this, ...args)
    }
  }

  service = { 
    on:this.on 
  }
}

Plugin.Auth = class PluginAuth extends Plugin {
  async authenticate(req) {
    return false;
  }
}

Plugin.Auth.Password = class PluginAuthPassword extends Plugin.Auth {
  constructor(engine, { userField = "username", passField = "password", ...rest }) {
    super(engine, rest);
    Object.assign(this, {
      userField,
      passField
    })
  }
  async authenticate(req) {
    const {
      [this.userField]: username,
      [this.passField]: password,
    } = req.body;
    if (await this.checkPassword(username, password)) {
      return username;
    }
  }
  async checkPassword(username, password) {
    return false;
  }
}

const PluginStore = Plugin.Store = class PluginStore extends Plugin {
}

const PluginStoreKey = Plugin.Store.Key = class PluginStoreKey extends Plugin.Store {
  get = (key) => {
    return this.map.get(key);
  }
  set = (key, val) => {
    return this.map.set(key, val);
  }
  delete = (key) => {
    return this.map.delete(key);
  }
  clear = () => {
    return this.map.clear();
  }
  service =  {
    ...this.service,
    get: this.get,
    set: this.set,
    delete: this.delete,
    clear: this.clear
  }
}


const PluginStoreFeathers = Plugin.Store.Feathers = class PluginStoreFeathers extends Plugin.Store {
  db = null;
  async get(id, query) {
    return await this.db.get(id, { query });
  }
  async create(data) {
    this.debug('CRT', data)
    return await this.db.create(data);
  }
  async update(id, data, query) {
    return await this.db.update(id, data, { query });
  }
  async patch(ud, data, query) {
    return await this.db.patch(key, { query });
  }
  async remove(id, query) {
    return await this.db.remove(id, { query });
  }
  async find(query) {
    return await this.db.find({ query });
  }
  async findOne(query) {
    const found = await this.db.find({ query });
    return found && found[0];
  }

  service = {
    ...this.service, 
    create: this.create.bind(this),
    update: this.update.bind(this),
    patch: this.patch.bind(this),
    remove: this.remove.bind(this),
    find: this.find.bind(this),
    findOne: this.findOne.bind(this),
  }
}



const PluginStoreMap = Plugin.Store.Map = class PluginStoreMap extends Plugin.Store {
  get(key) {
    return this.map.get(key);
  }
  set(key, val) {
    return this.map.set(key, val);
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

/*
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
  */
