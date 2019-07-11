server.directory = {};

/**
 * Create a directory if it doesn't exist.
 * @param {string} dir - path to new directory
 */
server.directory.make = function(dir) {
  if (!server.modules.fs.existsSync(dir)) {
    server.modules.fs.mkdirSync(dir);
  }
}
