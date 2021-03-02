
const {PluginBase} = require("./PluginBase.js");
exports.PluginPublish = class PluginPublish extends PluginBase {
  settings = {
    ...this.settings,
    url: url => String(url || '/public')
  }
  setup() {
    super.setup();
    this.urlpath = this.conf.urlpath;
  }
}
