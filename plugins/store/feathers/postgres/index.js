const knex = require('knex');
const service = require('feathers-knex');
const Path = require("path");

exports.Plugin = engine => {
  return class PluginStoreFile extends engine.Plugin.Store.Feathers {
    constructor(engine, { connection, table, searchPath = [], ...rest }) {
      super(engine, { ...rest });
      const filename = this.filename = Path.resolve(engine.config.dataDirectory,file);
      const Model= knex({
        client: 'pg',
        connection,
        searchpath
      });
      this.db = service({Model,name:table});
    }
  }
}
