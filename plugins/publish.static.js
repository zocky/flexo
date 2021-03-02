const { PluginPublish } = require("../lib/Plugin/PluginPublish")

exports.Plugin = class PublishStatic extends PluginPublish {

  settings = {
    ...this.settings,
    directory: dir => this.engine.resolvePath(dir || 'public')
  }

  setup() {
    super.setup();
    const express = require("express");
    const { url, directory } = this.settings;
    this.engine.routerUseAt(url,express.static(directory));
  }

}
