const fs = require("fs");
const peg = require("pegjs");
const path = require("path");
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor

const grammar = fs.readFileSync(path.join(__dirname,'flexo.pegjs'),"utf-8");
const parser = module.exports.parser = peg.generate(grammar);
module.exports.parse = source => {
  const parsed = parser.parse(source);
  return new AsyncFunction("$", parsed);
}
