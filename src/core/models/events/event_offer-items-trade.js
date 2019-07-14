/**
 * Event model.
 * @param {Object} socket - socket.io client socket object.
 * @param {Object} inputData - raw input recieved.
 */
function Event_offerItemsTrade(socket, inputData) {
  this.time = new Date();
  this.agent = server.models.Agent.get_agent_by_socket(socket);

  if (!(res = server.models.Event_offerItemsTrade.validate(inputData, this.agent)).status) {
    server.log('Bad event offerItemsTrade data ('+JSON.stringify(inputData) + ').', 1);
    server.send.event_failed(socket, server.models.Event_offerItemsTrade.event_name, res.message);
    return false;
  }

  this.items = res.items;
  this.trade = res.trade;

  server.control.add_items_to_trade(this.trade, this.items, this.agent);

  (server.models.Validate.objects = server.models.Validate.objects || []).push(this);
  server.log('Event offer-items-trade ' + this.trade.trade_id + ' registered.', 2);
}

Event_offerItemsTrade.event_name = 'offer-items-trade';

Event_offerItemsTrade.formats = [{
  'trade_id': 'number',
  'item_ids': 'object'
}]


/**
 * Event validation.
 * @param {Object} structure - raw input recieved.
 * @param {Object} agent - agent associated with this event.
 * @return {Object}
 */
Event_offerItemsTrade.validate = function(structure, agent) {

  if (!(res = server.models.Validate.validate_agent_logged_in(agent)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_key_format(server.models.Event_offerItemsTrade.formats, structure)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_array_types(structure.item_ids, 'number')).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_agent_owns_items(agent, structure.item_ids)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_items_not_in_transaction(res.items)).status) {
    return res;
  }
  var items = res.items;
  if (!(res = server.models.Validate.validate_trade_exists(structure.trade_id)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_trade_status(res.trade, [2])).status) {
    return res;
  }
  var res2 = res;
  if (!(res = server.models.Validate.validate_agent_logged_in(res.trade.agent_ini)).status) {
    return res;
  }

  return {status:true, message:'', trade:res2.trade, items:items};
};

server.models.Event_offerItemsTrade = Event_offerItemsTrade;
