const { Plugin } = require("../lib/Plugin")
const knex = require('knex');
const feathersService = require('feathers-knex');
const Path = require("path");

exports.Plugin = class PluginStorePostgres extends Plugin.Store.Feathers {
  constructor(engine, { connection, table, idField, searchPath = [], ...rest }) {
    super(engine, { ...rest });
    const Model = knex({
      client: 'pg',
      connection
    });
    this.db = feathersService({
      Model,
      name: table,
      id: idField
    });
  }
}
