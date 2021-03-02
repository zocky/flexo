const { Plugin } = require("../lib/Plugin")
const knex = require('knex');
const feathersService = require('feathers-knex');
const Path = require("path");

exports.Plugin = class PluginStoreSqlite extends Plugin.Store.Feathers {

  settings = {
    ...this.settings,
    table: String,
    file: this.engine.resolveDataPath
  }
  setup() {
    super.setup()
    const {file,table} = this.settings;

    const Model = knex({
      client: 'sqlite3',
      connection: {
        filename: file
      }
    });
    console.log(this.settings);
    this.db = feathersService({ Model, name:table });
  }
}
