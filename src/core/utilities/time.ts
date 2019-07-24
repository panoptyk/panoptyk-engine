server.clock = {};

// In the future you will want to change this to fake "Panoptyk" time.
server.clock.get_datetime = function() {
  var today = new Date();  
  return today.getUTCSeconds();
}
