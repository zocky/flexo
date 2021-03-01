const { Plugin } = require("../lib/Plugin")
const knex = require('knex');
const feathersService = require('feathers-knex');
const Path = require("path");

exports.Plugin = class PluginStoreSqlite extends Plugin.Store.Feathers {
  constructor(engine, { file, table, ...rest }) {
    super(engine, { ...rest });
    const filename = this.filename = engine.resolveDataPath(file)
    const Model = knex({
      client: 'sqlite3',
      connection: {
        filename
      }
    });
    this.db = feathersService({ Model, name: table });
  }
}
