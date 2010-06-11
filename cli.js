#!/usr/bin/env node

// don't assume that npm is installed in any particular spot, since this
// might conceivably be a bootstrap attempt.
var fs = require("fs")
  , path = require("path")
  , sys = require("sys")
  , npm = require("./npm")

  // supported commands.
  , log = require("./lib/utils/log")
  , argv = process.argv.slice(2)
  , arg = ""

  , conf = {}
  , key
  , arglist = []
  , command
  , flagsDone

log(sys.inspect(argv), "cli")

while (arg = argv.shift()) {
  if (!command && (arg in npm.commands)) {
    if (key) {
      conf[key] = true
      key = null
    }
    command = arg
  } else if (!flagsDone && arg.substr(0, 2) === "--") {
    if (key) conf[key] = true
    key = arg.substr(2)
    flagsDone = (key === "")
  } else if (key) {
    conf[key] = arg
    key = null
  } else arglist.push(arg)
}
if (key) conf[key] = true
npm.argv = arglist
for (var k in conf) npm.config.set(k, conf[k])

var vindex = arglist.indexOf("-v")
  , printVersion = vindex !== -1 || conf.version
if (printVersion) {
  sys.puts(npm.version)
  if (vindex !== -1) arglist.splice(vindex, 1)
} else log(npm.version, "version")  

process.addListener("uncaughtException", errorHandler)

if (!command) { if (!printVersion) {
  // npm.commands.help([arglist.join(" ")])
  if (arglist.length) log(arglist, "unknown command")
  sys.error( "What do you want me to do?\n\n"
           + "Usage:\n"
           + "  npm [flags] <command> [args]\n"
           + "Check 'man npm' or 'man npm-help' for more information\n\n"
           + "This is supposed to happen.  "
           )
}} else npm.commands[command](arglist, errorHandler)

function errorHandler (er) {
  if (er) {
    sys.error("")
    log(er, "!")
    sys.error("")
    log("try running: 'npm help "+command+"'", "failure")
    log("Report this *entire* log at <http://github.com/isaacs/npm/issues>", "failure")
    log("or email it to <npm-@googlegroups.com>", "failure")
  } else log("ok")
}

