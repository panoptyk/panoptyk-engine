server.send = {}

/**
 * Send an event failure to a client.
 * @param {Object} socket - Socket.io object
 * @param {string} eventName - name of event that failed
 * @param {string} errorMessage - error details
 */
server.send.event_failed = function(socket, eventName, errorMessage) {
  server.log(eventName + ': ' + errorMessage, 1);
  socket.emit('event-failed', {'event_name': eventName, 'error_message': errorMessage});
}


/**
 * Send login success message to client.
 * @param {Object} agent - agent object associated with client
 */
server.send.login_complete = function(agent) {
  server.log('Sent login confirmation to agent ' + agent.agentName + '.', 2);
  agent.socket.emit('login-complete', {'agent_data': agent.get_private_data()});
}


/**
 * Notify all agents in a room that agent entered the room.
 * Assumes agent's room object is new room.
 * @param {Object} agent - agent object
 * @param {Object} old_room - room object agent is coming from
 */
server.send.agent_enter_room = function(agent, old_room=null) {
  let room = server.models.Room.objects[agent.room];
  if (old_room == null) {
    old_room = room.adjacents[Math.floor(Math.random() * room.adjacents.length)];
  }

  server.log('Agent ' + agent.agentName + ' entered room ' + room.name + '.', 2);
  agent.socket.to(room.room_id).emit('agent-enter-room',
    {'agent_data': agent.get_public_data(), 'room_id': old_room.room_id});
}


/**
 * Notify all agents in a room that agent left the room.
 * Assumes agent is still in old room.
 * @param {Object} agent - agent object
 * @param {Object} new_room - room object that agent is exiting to.
 */
server.send.agent_exit_room = function(agent, new_room=null) {
  let room = server.models.Room.objects[agent.room];
  if (new_room == null) {
    new_room = room.adjacents[Math.floor(Math.random() * room.adjacents.length)];
  }

  server.log('Agent ' + agent.agentName + ' left room ' + room.name + '.', 2);
  agent.socket.to(room.room_id).emit('agent-exit-room',
    {'agent_id': agent.agent_id, 'room_id': new_room.room_id});
}


/**
 * Give all room data to client.
 * @param {Object} socket - Socket.io object
 * @param {Object} room - room object
 */
server.send.room_data = function(agent, room, old_room=null) {
  server.log('Agent ' + agent.agentName + ' getting room data for room ' + room.name + '.', 2);
  var old_room_id = old_room === null ? null : old_room.room_id;

  agent.socket.emit('room-data',
    {'room_data': room.get_data(),
      'old_room_id': old_room_id,
      'agents': room.get_agents(agent),
      'items': room.get_items()});
}


/**
 * Add a list of items to an agent's inventory.
 * @param {Object} agent - agent object
 * @param {Object} items - array of items to add to inventory
 */
server.send.add_items_inventory = function(agent, items) {
  var dat = [];
  for (let item of items) {
    dat.push(item.get_data());
  }

  server.log('Gave items ' + JSON.stringify(dat) + ' to agent ' + agent.agentName + '.', 2);
  agent.socket.emit('add-items-inventory', {'items_data': dat});
}

/**
 * Add a list of items to an agent's inventory.
 * @param {Object} agent - agent object
 * @param {Object} info - array of items to add to inventory
 */
server.send.add_info_inventory = function(agent, info) {
  var dat = [];
  for (let inf of info) {
    dat.push(inf);
  }
  // GROSS PATCHWORK PLS DELETE
  info = info[0];
  if (info.reference) {
    info = server.models.Info.objects[info.infoID];
  }
  let msg = server.models.Info.get_ACTION(info.action).name + '(' + info.time + ', ' + server.models.Agent.objects[info.agent].name + ', ' + server.models.Room.objects[info.location].name + ')';

  server.log('Gave info ' + JSON.stringify(dat) + ' to agent ' + agent.agentName + '.', 2);
  agent.socket.emit('add-info-inventory', {'info_data': dat, 'message': [msg]});
}

/**
 * Remove a list of items from an agent's inventory. Assumes valid data.
 * @param {Object} agent - agent object
 * @param {Object} items - array of items to be removed from agent's inventory.
 */
server.send.remove_items_inventory = function(agent, items) {
  var dat = [];
  for (let item of items) {
    dat.push(item.item_id);
  }

  server.log('Remove items ' + JSON.stringify(dat) + ' from agent ' + agent.agentName + '.', 2);
  agent.socket.emit('remove-items-inventory', {'item_ids': dat});
}


/**
 * Add a list of items to a room.
 * @param {Object} items - item objects
 * @param {Object} room - room object
 */
server.send.add_items_room = function(items, room, by_agent=null) {
  var dat = [];
  for (let item of items) {
    dat.push(item.get_data());
  }

  var agent_id = by_agent === null ? null : by_agent.agent_id;

  server.log('Put items ' + JSON.stringify(dat) + ' to room ' + room.name + '.', 2);
  server.modules.io.in(room.room_id).emit('add-items-room',
    {'items_data': dat, 'agent_id': agent_id});
}


/**
 * Remove a list of items from a room. Assumes valid data.
 * @param {Object} items - item objects
 * @param {Object} room - room object
 */
server.send.remove_items_room = function(items, room, by_agent=null) {
  var dat = [];
  for (let item of items) {
    dat.push(item.item_id);
  }

  var agent_id = by_agent === null ? null : by_agent.agent_id;

  server.log('Remove items ' + JSON.stringify(dat) + ' from room ' + room.name + '.', 2);
  server.modules.io.in(room.room_id).emit('remove-items-room',
    {'item_ids': dat, 'agent_id': agent_id});
}


/**
 * Add an agent to a conversation. Send to all agents in room.
 * @param {Object} agent - agent to join conversation.
 */
server.send.agent_join_conversation = function(agent) {
  server.log('Agent ' + agent.agentName + ' entered conversation ' + agent.conversation.conversation_id + '.', 2);
  server.modules.io.in(agent.room).emit('agent-join-conversation',
    {'conversation_id': agent.conversation.conversation_id, 'agent_id': agent.agent_id});
}


/**
 * Remove an agent from a conversation. Send to all agents in room.
 * @param {Object} agent - agent to leave conversation.
 * @param {Object} conversation - left conversation.
 */
server.send.agent_leave_conversation = function(agent, conversation) {
  server.log('Agent ' + agent.agentName + ' left conversation ' + conversation.conversation_id + '.', 2);
  server.modules.io.in(agent.room.room_id).emit('agent-leave-conversation',
    {'conversation_id': conversation.conversation_id, 'agent_id': agent.agent_id});
}


/**
 * Add items to a trade. Send to specified socket.
 * @param {Object} socket - socket object to update.
 * @param {Object} trade - trade object.
 * @param [Object] items - array of items to add.
 * @param {Object} owner - agent adding the items.
 */
server.send.add_items_trade = function(socket, trade, items, owner) {
  var item_data = [];

  for (let item of items) {
    item_data.push(item.get_data());
  }

  socket.emit('add-items-trade', {
    'trade_id': trade.trade_id,
    'agent_id': owner.agent_id,
    'items_data': item_data
  });
}


/**
 * Remove items from a trade. Send to specified socket.
 * @param {Object} socket - socket object to update.
 * @param {Object} trade - trade object.
 * @param [Object] items - array of items to remove.
 * @param {Object} owner - agent removing the items.
 */
server.send.remove_items_trade = function(socket, trade, items, owner) {
  var ids = [];
  for (let item of items) {
    ids.push(item.item_id);
  }

  socket.emit('remove-items-trade', {
    'trade_id':trade.trade_id,
    'agent_id':owner.agent_id,
    'item_ids':ids
  });
}


/**
 * Update socket of trade ready status.
 * @param {Object} socket - socket object to update.
 * @param {Object} trade - trade object.
 * @param {Object} agent - agent with the ready status.
 * @param {boolean} ready_status - true if trade is ready, false if trade is not ready.
 */
server.send.agent_ready_trade = function(socket, trade, agent, ready_status) {
  socket.emit("agent-ready-trade",
    {trade_id:trade.trade_id, agent_id:agent.agent_id, ready_status:ready_status});
}


/**
 * Update socket with trade request.
 * @param {Object} socket - socket object to update.
 * @param {Object} trade - trade object.
 */
server.send.trade_requested = function(socket, trade) {
  server.log("Trade "+ trade.trade_id +
    " requested (" + trade.agent_ini.name + "/" + trade.agent_res.name + ").", 2);

  socket.emit("trade-requested", {trade_id:trade.trade_id, agent_id:trade.agent_ini.agent_id});
}


/**
 * Update socket with trade accept (trade is ready to start).
 * @param {Object} socket - socket object to update.
 * @param {Object} trade - trade object.
 * @param {Object} agent - agent object of other agent in trade.
 */
server.send.trade_accepted = function(socket, trade, other_agent) {
  server.log("Trade "+ trade.trade_id +
    " accepted (" + trade.agent_ini.name + "/" + trade.agent_res.name + ").", 2);

  socket.emit("trade-accepted", {trade_id:trade.trade_id, agent_id:other_agent.agent_id});
}


/**
 * Update socket with trade cancelation.
 * @param {Object} socket - socket object to update.
 * @param {Object} trade - trade object.
 */
server.send.trade_declined = function(socket, trade) {
  server.log("Trade "+ trade.trade_id +
    " declined (" + trade.agent_ini.name + "/" + trade.agent_res.name + ").", 2);

  socket.emit("trade-declined", {trade_id:trade.trade_id});
}


/**
 * Update socket with trade cancelation.
 * @param {Object} socket - socket object to update.
 * @param {Object} trade - trade object.
 */
server.send.trade_complete = function(socket, trade) {
  server.log("Trade "+ trade.trade_id +
    " completed (" + trade.agent_ini.name + "/" + trade.agent_res.name + ").", 2);

  socket.emit("trade-complete", {trade_id:trade.trade_id});
}


server.send.conversation_requested = function(agent, to_agent) {
  server.log("Conversation request from " + agent.agentName + " to " + to_agent.agentName);

  to_agent.socket.emit("conversation-requested", {agent_id:agent.agent_id});
}
