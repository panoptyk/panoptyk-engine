server.logger = {};
server.logger.logLevelNames = [' ERROR ', 'WARNING', '  INFO '];

/**
 * Log a message at specified important level.
 * @param {string} msg - message to log.
 * @param {int} logLevel - level of message importance.
 */
server.log = function(msg, logLevel=0, file=null) {
  if (logLevel <= server.settings.log_level){
    var prefix = '[' + (new Date()).toISOString()
      .replace(/T/, ' ').replace(/\..+/, '') + "]═["
      + server.logger.logLevelNames[logLevel] + "]══";

    msg = prefix + (prefix.length + msg.length >= server.settings.log_line_length ?
      '╦═╡ ':'══╡ ') + msg;

    msg = msg.replace(new RegExp('(.{'+server.settings.log_line_length+'})', 'g'),
      '$1\n                                 ╠══╡ ');

    var index = msg.lastIndexOf("╠");
    if (index > 0) {
      msg = msg.substr(0, index) + "╚" + msg.substr(index + 1);
    }

    if (file != null) {
      msg += " [" + file + "]";
    }

    console.log(msg);
  }
}
