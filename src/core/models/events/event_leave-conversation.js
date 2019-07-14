/**
 * Event model.
 * @param {Object} socket - socket.io client socket object.
 * @param {Object} inputData - raw input recieved.
 */
function Event_leaveConversation(socket, inputData) {
  this.time = new Date();
  this.agent = server.models.Agent.get_agent_by_socket(socket);

  if (!(res = server.models.Event_leaveConversation.validate(inputData, this.agent)).status) {
    server.log('Bad event leaveConversation data ('+JSON.stringify(inputData) + ').', 1);
    server.send.event_failed(socket, server.models.Event_leaveConversation.event_name, res.message);
    return false;
  }

  this.conversation = res.conversation;

  server.control.remove_agent_from_conversation(this.conversation, this.agent);

  (server.models.Validate.objects = server.models.Validate.objects || []).push(this);
  server.log('Event leave-conversation (' + this.conversation.conversation_id + ') for agent ' + this.agent.name + ' registered.', 2);
}

Event_leaveConversation.event_name = 'leave-conversation';

Event_leaveConversation.formats = [{
  'conversation_id': 'number'
}]


/**
 * Event validation.
 * @param {Object} structure - raw input recieved.
 * @param {Object} agent - agent associated with this event.
 * @return {Object}
 */
Event_leaveConversation.validate = function(structure, agent) {

  if (!(res = server.models.Validate.validate_agent_logged_in(agent)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_key_format(server.models.Event_leaveConversation.formats, structure)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_conversation_exists(agent.room, server.models.Conversation.get_conversation_by_id(structure.conversation_id))).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_conversation_has_agent(res.conversation, agent)).status) {
    return res;
  }
  return res;
};

server.models.Event_leaveConversation = Event_leaveConversation;
