/**
 * Event model.
 * @param {Object} socket - socket.io client socket object.
 * @param {Object} inputData - raw input recieved.
 */
function Event_acceptConversation(socket, inputData) {
  this.time = new Date();
  this.from_agent = server.models.Agent.get_agent_by_socket(socket);

  if (!(res = server.models.Event_acceptConversation.validate(inputData, this.from_agent)).status) {
    server.log('Bad event acceptConversation data ('+JSON.stringify(inputData) + ').', 1);
    server.send.event_failed(socket, server.models.Event_acceptConversation.event_name, res.message);
    return false;
  }

  this.conversation = res.conversation;
  this.to_agent = res.conversation.agent_ini;
  this.room = from_agent.room;  //TODO: change this when room validation is added
  this.conversation = server.control.create_conversation(this.room, this.from_agent, this.to_agent);

  (server.models.Validate.objects = server.models.Validate.objects || []).push(this);
  server.log('Event accept-conversation (' + this.conversation.conversation_id + ') for agent ' + this.from_agent.name + '/' + this.to_agent.name + ' registered.', 2);
}

Event_acceptConversation.event_name = 'accept-conversation';

Event_acceptConversation.formats = [{
  'agent_id': 'number'
}]


/**
 * Event validation.
 * @param {Object} structure - raw input recieved.
 * @param {Object} agent - agent associated with this event.
 * @return {Object}
 */
Event_acceptConversation.validate = function(structure, agent) {

  if (!(res = server.models.Validate.validate_agent_logged_in(agent)).status) {
    return res;
  }
  if (!(res = server.models.Validate.validate_key_format(server.models.Event_acceptConversation.formats, structure)).status) {
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

server.models.Event_acceptConversation = Event_acceptConversation;
