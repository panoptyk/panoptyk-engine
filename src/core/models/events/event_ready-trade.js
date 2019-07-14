/**
 * Event model.
 * @param {Object} socket - socket.io client socket object.
 * @param {Object} inputData - raw input recieved.
 */
function Event_readyTrade(socket, inputData) {
  this.time = new Date();
  this.agent = server.models.Agent.get_agent_by_socket(socket);

  if (!(res = server.models.Event_readyTrade.validate(inputData, this.agent)).status) {
    server.log('Bad event readyTrade data ('+JSON.stringify(inputData) + ').', 1);
    server.send.event_failed(socket, server.models.Event_readyTrade.event_name, res.message);
    return false;
  }

  this.trade = res.trade;
  this.ready_status = inputData.ready_status;

  server.control.set_trade_agent_status(this.trade, this.agent, this.ready_status);

  (server.models.Validate.objects = server.models.Validate.objects || []).push(this);
  server.log('Event ready-trade ' + this.trade.trade_id + ' registered.', 2);
}

Event_readyTrade.event_name = 'ready-trade';

Event_readyTrade.formats = [{
  'trade_id': 'number',
  'ready_status': 'boolean'
}]


/**
 * Event validation.
 * @param {Object} structure - raw input recieved.
 * @param {Object} agent - agent associated with this event.
 * @return {Object}
 */
Event_readyTrade.validate = function(structure, agent) {

  if (!(res = server.models.Validate.validate_agent_logged_in(agent)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_key_format(server.models.Event_readyTrade.formats, structure)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_trade_exists(structure.trade_id)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_trade_status(res.trade, [2])).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_ready_status(res.trade, agent, !structure.ready_status)).status) {
    return res;
  }
  var res2 = res;
  if (!(res = server.models.Validate.validate_agent_logged_in(res.trade.agent_ini)).status) {
    return res;
  }

  return {status:true, message:'', trade:res2.trade};
};

server.models.Event_readyTrade = Event_readyTrade;
