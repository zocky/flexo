const knex = require('knex');
const service = require('feathers-knex');
const Path = require("path");

exports.Plugin = engine => {
  return class PluginStoreFile extends engine.Plugin.Store.Feathers {
    constructor(engine, { connection, table, idField, searchPath = [], ...rest }) {
      super(engine, { ...rest });
      const Model= knex({
        client: 'pg',
        connection
      });
      this.db = service({
        Model,
        name:table,
        id:idField
      });
    }
  }
}
