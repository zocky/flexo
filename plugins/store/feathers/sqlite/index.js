const knex = require('knex');
const service = require('feathers-knex');
const Path = require("path");

exports.Plugin = engine => {
  return class PluginStoreFile extends engine.Plugin.Store.Feathers {
    constructor(engine, { file, table, ...rest }) {
      super(engine, { ...rest });
      const filename = this.filename = Path.resolve(engine.config.dataDirectory,file);
      const Model= knex({
        client: 'sqlite3',
        connection: {
          filename
        }
      });
      this.db = service({Model,name:table});
    }
  }
}
