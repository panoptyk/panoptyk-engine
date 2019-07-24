/**
 * Event model.
 * @param {Object} socket - socket.io client socket object.
 * @param {Object} inputData - raw input recieved.
 */
function Event_acceptTrade(socket, inputData) {
  this.time = new Date();
  this.from_agent = server.models.Agent.get_agent_by_socket(socket);

  if (!(res = server.models.Event_acceptTrade.validate(inputData, this.from_agent)).status) {
    server.log('Bad event acceptTrade data ('+JSON.stringify(inputData) + ').', 1);
    server.send.event_failed(socket, server.models.Event_acceptTrade.event_name, res.message);
    return false;
  }

  this.conversation = res.conversation;
  this.to_agent = res.trade.agent_ini;
  this.trade = res.trade;

  server.control.accept_trade(this.trade);

  (server.models.Validate.objects = server.models.Validate.objects || []).push(this);
  server.log('Event accept-trade (' + this.trade.trade_id + ') for agent ' + this.from_agent.name + '/' + this.to_agent.name + ' registered.', 2);
}

Event_acceptTrade.event_name = 'accept-trade';

Event_acceptTrade.formats = [{
  'trade_id': 'number'
}]


/**
 * Event validation.
 * @param {Object} structure - raw input recieved.
 * @param {Object} agent - agent associated with this event.
 * @return {Object}
 */
Event_acceptTrade.validate = function(structure, agent) {

  if (!(res = server.models.Validate.validate_agent_logged_in(agent)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_key_format(server.models.Event_acceptTrade.formats, structure)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_trade_exists(structure.trade_id)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_trade_status(res.trade, [3])).status) {
    return res;
  }
  var res2 = res;
  if (!(res = server.models.Validate.validate_agent_logged_in(res.trade.agent_ini)).status) {
    return res;
  }

  return res2;
};

server.models.Event_acceptTrade = Event_acceptTrade;
