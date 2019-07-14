/**
 * Event model.
 * @param {Object} socket - socket.io client socket object.
 * @param {Object} inputData - raw input recieved.
 */
function Event_takeItems(socket, inputData) {
  this.time = new Date();
  this.agent = server.models.Agent.get_agent_by_socket(socket);

  if (!(res = server.models.Event_takeItems.validate(inputData, this.agent)).status) {
    server.log("Bad event takeItems data ("+JSON.stringify(inputData) + ').', 1);
    server.send.event_failed(socket, server.models.Event_takeItems.event_name, res.message);
    return false;
  }

  this.items = res.items;
  this.room = this.agent.room;

  server.control.remove_agent_from_conversation_if_in(this.agent);
  server.control.remove_items_from_room(this.items, this.agent);
  server.control.add_items_to_agent_inventory(this.agent, this.items);

  var item_names = [];
  for (let item of this.items){
    item_names.push(item.name);
  }
  server.control.give_info_to_agents(this.room.occupants, (this.agent.name + " picked up " +
    item_names.join(", ") + " in room " + this.room.name));

  (server.models.Validate.objects = server.models.Validate.objects || []).push(this);
  server.log('Event take-items (' + JSON.stringify(inputData.item_ids) + ') for agent '
      + this.agent.name + ' registered.', 2);

}

Event_takeItems.event_name = "take-items";

Event_takeItems.formats = [{
    "item_ids": "object"
  }];


/**
 * Event validation.
 * @param {Object} structure - raw input recieved.
 * @param {Object} agent - agent associated with this event.
 * @return {Object}
 */
Event_takeItems.validate = function(structure, agent) {
  if (!(res = server.models.Validate.validate_agent_logged_in(agent)).status) {
    return res;
  }

  if (!(res = server.models.Validate.validate_key_format(server.models.Event_takeItems.formats, structure)).status) {
    return res;
  }

  // check if item in room
  if (!(res = server.models.Validate.validate_items_in_room(agent.room, structure.item_ids)).status) {
    return res;
  }

  // return items as well
  return res;
};

server.models.Event_takeItems = Event_takeItems;
