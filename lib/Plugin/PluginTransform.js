const fs = require("fs").promises;

const {PluginBase} = require("./PluginBase.js");
exports.PluginTransform = class PluginTransform extends PluginBase {
  settings = {
    encoding: "utf-8",
    contentType: "text/plain",
    contentEncoding: "utf-8"
  }
  
  service = {
    ...this.service,
    transform: this.transform,
    transformFile: this.transformFile,
  }
  async transformFile(file,options={}) {
    const content = await this.readFile(file,options);
    return await this.transform(content,options);
  }

  async readFile(file,options={}) {
    file = this.engine.resolvePath(file);
    return await fs.readFile(file,options.encoding || this.settings.encoding);
  }

  transform (content,options={}) {
    return content;
  }
}
