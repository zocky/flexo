const { Plugin } = require("../lib/Plugin")
const knex = require('knex');
const feathersService = require('feathers-knex');
const Path = require("path");

exports.Plugin = class PluginStorePostgres extends Plugin.Store.Feathers {

  settings = {
    ...this.settings,
    connection: Object,
    table: String,
    idField: String
  }
  setup() {
    super.setup()
    const { connection, table: name, idField: id } = this.settings;

    const Model = knex({
      client: 'pg',
      connection
    });
    this.db = feathersService({
      Model,
      name,
      id
    });
  }
}