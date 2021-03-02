const { PluginPublish } = require("../lib/Plugin/PluginPublish")
const Path = require("path");

exports.Plugin = class PublishTransform extends PluginPublish {

  settings = {
    ...this.settings,
    directory: dir => this.engine.resolvePath(dir || 'public'),
    transform: t => [].concat(t)
  }

  transforms = {};

  setup() {
    for (const t of this.settings.transform) {
      const transform = this.engine.getOrCreateService(t);
      this.transforms[transform.settings.extension] = transform;
    }
    this.setupRoute();
  }


  setupRoute() {
    const { url, directory } = this.settings;
    this.engine.addRoute('get', url + '/:filename', async (req, res) => {
      const { filename } = req.params;
      const extension = filename.split('.').slice(1).pop();
      const transform = this.transforms[extension];

      if (!transform) {
        res.send('no ' + extension + ' in ' + Object.keys(this.transforms));
        return res.sendStatus(404);
      }
      const file = Path.join(directory, filename);
      console.log({ url, directory, filename, extension, file })
      if (!this.utils.fileExists(file)) {
        return res.sendStatus(404);
      };
      const content = await transform.transformFile(file);
      console.log(transform);
      res.contentType(transform.settings.contentType);
      res.send(content);
    })
  }
}

