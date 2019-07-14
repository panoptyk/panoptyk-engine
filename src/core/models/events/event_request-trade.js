/**
 * Event model.
 * @param {Object} socket - socket.io client socket object.
 * @param {Object} inputData - raw input recieved.
 */
function Event_requestTrade(socket, inputData) {
  this.time = new Date();
  this.agent = server.models.Agent.get_agent_by_socket(socket);

  if (!(res = server.models.Event_requestTrade.validate(inputData, this.agent)).status) {
    server.log('Bad event requestTrade data ('+JSON.stringify(inputData) + ').', 1);
    server.send.event_failed(socket, server.models.Event_requestTrade.event_name, res.message);
    return false;
  }

  this.conversation = res.conversation;
  this.to_agent = res.to_agent;

  this.trade = server.control.create_trade(this.conversation, this.agent, this.to_agent);

  (server.models.Validate.objects = server.models.Validate.objects || []).push(this);
  server.log('Event request-trade (' + this.conversation.conversation_id + ') for agent ' + this.agent.name + ' registered.', 2);
}

Event_requestTrade.event_name = 'request-trade';

Event_requestTrade.formats = [{
  'agent_id': 'number'
}]


/**
 * Event validation.
 * @param {Object} structure - raw input recieved.
 * @param {Object} agent - agent associated with this event.
 * @return {Object}
 */
Event_requestTrade.validate = function(structure, agent) {

  if (!(res = server.models.Validate.validate_agent_logged_in(agent)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_key_format(server.models.Event_requestTrade.formats, structure)).status) {
    return res;
  }
  var to_agent = server.models.Agent.get_agent_by_id(structure.agent_id);
  if (!(res = server.models.Validate.validate_agent_logged_in(to_agent)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_agents_share_conversation(agent, to_agent)).status) {
    return res;
  }
  return res;
};

server.models.Event_requestTrade = Event_requestTrade;
