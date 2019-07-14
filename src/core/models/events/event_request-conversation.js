/**
 * Event model.
 * @param {Object} socket - socket.io client socket object.
 * @param {Object} inputData - raw input recieved.
 */
function Event_requestConversation(socket, inputData) {
  this.time = new Date();
  this.agent = server.models.Agent.get_agent_by_socket(socket);
  if (!(res = server.models.Event_requestConversation.validate(inputData, this.agent)).status) {
    server.log('Bad event requestConversation data ('+JSON.stringify(inputData) + ').', 1);
    server.send.event_failed(socket, server.models.Event_requestConversation.event_name, res.message);
    return false;
  }

  this.to_agent = server.models.Agent.get_agent_by_id(inputData.agent_id);

  server.control.request_conversation(this.agent, this.to_agent);

  (server.models.Validate.objects = server.models.Validate.objects || []).push(this);
  server.log('Event request-conversation from (' + this.agent.name + ') to agent ' + this.to_agent.name + ' registered.', 2);
}

Event_requestConversation.event_name = 'request-conversation';

Event_requestConversation.formats = [{
  'agent_id': 'number'
}]


/**
 * Event validation.
 * @param {Object} structure - raw input recieved.
 * @param {Object} agent - agent associated with this event.
 * @return {Object}
 */
Event_requestConversation.validate = function(structure, agent) {

  if (!(res = server.models.Validate.validate_agent_logged_in(agent)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_key_format(server.models.Event_requestConversation.formats, structure)).status) {
    return res;
  }
  var to_agent = server.models.Agent.get_agent_by_id(structure.agent_id);
  if (!(res = server.models.Validate.validate_agent_logged_in(to_agent)).status) {
    return res;
  }
  //TODO: validate agents are not already in a conversation
  //TODO: validate agents are in same room
  return res;
};

server.models.Event_requestConversation = Event_requestConversation;
