const Plugin = exports.Plugin = require("./PluginBase").PluginBase;

Plugin.Auth = require("./PluginAuth").PluginAuth;
Plugin.Auth.Passport = require("./PluginAuthPassport").PluginAuthPassport;
Plugin.Auth.Password = require("./PluginAuthPassword").PluginAuthPassword;
Plugin.Store = require("./PluginStore").PluginStore;
Plugin.Store.Feathers = require("./PluginStoreFeathers").PluginStoreFeathers;
Plugin.Store.Key = require("./PluginStoreKey").PluginStoreKey;
Plugin.Store.Map = require("./PluginStoreMap").PluginStoreMap;
