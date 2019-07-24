/**
 * Event model.
 * @param {Object} socket - socket.io client socket object.
 * @param {Object} inputData - raw input recieved.
 */
function Event_dropItems(socket, inputData) {
  this.time = new Date();
  this.agent = server.models.Agent.get_agent_by_socket(socket);

  if (!(res = server.models.Event_dropItems.validate(inputData, this.agent)).status) {
    server.log('Bad event dropItems data.', 1);
    server.send.event_failed(socket, server.models.Event_dropItems.event_name, res.message);
    return false;
  }

  this.items = res.items;
  this.room = this.agent.room;

  server.control.remove_items_from_agent_inventory(this.items);
  server.control.add_items_to_room(this.room, this.items, this.agent);

  var item_names = [];
  for (let item of this.items){
    item_names.push(item.name);
  }
  server.control.give_info_to_agents(this.room.occupants, (this.agent.name + " dropped " +
    item_names.join(", ") + " in room " + this.room.name));

  (server.models.Validate.objects = server.models.Validate.objects || []).push(this);
  server.log('Event drop-items (' + JSON.stringify(inputData.item_ids) + ') for agent '
      + this.agent.name + ' registered.', 2);
}

Event_dropItems.event_name = 'drop-items';

Event_dropItems.formats = [{
  'item_ids': 'object',
}];


/**
 * Event validation.
 * @param {Object} structure - raw input recieved.
 * @param {Object} agent - agent associated with this event.
 * @return {Object}
 */
Event_dropItems.validate = function(structure, agent) {
  if (!(res = server.models.Validate.validate_key_format(server.models.Event_dropItems.formats, structure)).status) {
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
  return res;
};

server.models.Event_dropItems = Event_dropItems;
