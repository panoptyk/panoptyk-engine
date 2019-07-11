/**
 * Event model.
 * @param {Object} socket - socket.io client socket object.
 * @param {Object} inputData - raw input recieved.
 */
function Event_withdrawItemsTrade(socket, inputData) {
  this.time = new Date();
  this.agent = server.models.Agent.get_agent_by_socket(socket);

  if (!(res = server.models.Event_withdrawItemsTrade.validate(inputData, this.agent)).status) {
    server.log('Bad event withdrawItemsTrade data ('+JSON.stringify(inputData) + ').', 1);
    server.send.event_failed(socket, server.models.Event_withdrawItemsTrade.event_name, res.message);
    return false;
  }

  this.items = res.items;
  this.trade = res.trade;

  server.control.remove_items_from_trade(this.trade, this.items, this.agent);

  (server.models.Validate.objects = server.models.Validate.objects || []).push(this);
  server.log('Event withdraw-items-trade ' + this.trade.trade_id + ' registered.', 2);
}

Event_withdrawItemsTrade.event_name = 'withdraw-items-trade';

Event_withdrawItemsTrade.formats = [{
  'trade_id': 'number',
  'item_ids': 'object'
}]


/**
 * Event validation.
 * @param {Object} structure - raw input recieved.
 * @param {Object} agent - agent associated with this event.
 * @return {Object}
 */
Event_withdrawItemsTrade.validate = function(structure, agent) {

  if (!(res = server.models.Validate.validate_agent_logged_in(agent)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_key_format(server.models.Event_withdrawItemsTrade.formats, structure)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_array_types(structure.item_ids, 'number')).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_agent_owns_items(agent, structure.item_ids)).status) {
    return res;
  }
  var items = res.items;
  if (!(res = server.models.Validate.validate_trade_exists(structure.trade_id)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_trade_status(res.trade, [2])).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_items_in_trade(items, res.trade, agent)).status) {
    return res;
  }
  var res2 = res;
  if (!(res = server.models.Validate.validate_agent_logged_in(res.trade.agent_ini)).status) {
    return res;
  }

  return {status:true, message:'', trade:res2.trade, items:items};
};

server.models.Event_withdrawItemsTrade = Event_withdrawItemsTrade;
