/**
 * Event model.
 * @param {Object} socket - socket.io client socket object.
 * @param {Object} inputData - raw input recieved.
 */
function Event_joinConversation(socket, inputData) {
  this.time = new Date();
  this.agent = server.models.Agent.get_agent_by_socket(socket);

  if (!(res = server.models.Event_joinConversation.validate(inputData, this.agent)).status) {
    server.log('Bad event joinConversation data ('+JSON.stringify(inputData) + ').', 1);
    server.send.event_failed(socket, server.models.Event_joinConversation.event_name, res.message);
    return false;
  }

  this.conversation = res.conversation;

  server.control.add_agent_to_conversation(this.conversation, this.agent);

  (server.models.Validate.objects = server.models.Validate.objects || []).push(this);
  server.log('Event join-conversation (' + this.conversation.conversation_id + ') for agent ' + this.agent.name + ' registered.', 2);
}

Event_joinConversation.event_name = 'join-conversation';

Event_joinConversation.formats = [{
  'conversation_id': 'number'
}]


/**
 * Event validation.
 * @param {Object} structure - raw input recieved.
 * @param {Object} agent - agent associated with this event.
 * @return {Object}
 */
Event_joinConversation.validate = function(structure, agent) {

  if (!(res = server.models.Validate.validate_agent_logged_in(agent)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_key_format(server.models.Event_joinConversation.formats, structure)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_conversation_exists(agent.room, server.models.Conversation.get_conversation_by_id(structure.conversation_id))).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_conversation_has_space(res.conversation)).status) {
    return res;
  }
  return res;
};

server.models.Event_joinConversation = Event_joinConversation;
