const Path = require("path");

module.exports.Config = config => {
  return new class ConfigFlexo {
    port = process.env.PORT || config.port || 3000;
    rootDirectory = Path.resolve(process.env.FLEXO_ROOT || config.rootDirectory || ".");
    configDirectory = Path.resolve(this.rootDirectory, process.env.FLEXO_CONFIG || config.configDirectory || "config");
    dataDirectory = Path.resolve(this.rootDirectory, process.env.FLEXO_DATA || config.dataDirectory || ".data");
    cacheDirectory = Path.resolve(this.rootDirectory, process.env.FLEXO_CACHE|| config.cacheDirectory || ".cache");
    publicDirectory = Path.resolve(this.rootDirectory, process.env.FLEXO_PUBLIC || config.publicDirectory || "public");
    viewsDirectory = Path.resolve(this.rootDirectory, process.env.FLEXO_VIEWS || config.viewsDirectory || "views");
    pagesDirectory = Path.resolve(this.viewsDirectory, "pages");
    templatesDirectory = Path.resolve(this.viewsDirectory, "templates");
    layoutsDirectory = Path.resolve(this.viewsDirectory, "layouts");
    helpersDirectory = Path.resolve(this.viewsDirectory, "helpers");
    stylesDirectory = Path.resolve(this.rootDirectory, "styles");
    defaultLayout = "main"
    services = config.services || []
  }
} 