Client.send = {};

Client.send.login = function(username, password) {
  Client.socket.emit('login', {username:username, password:password});
}

Client.send.moveToRoom = function(room_id) {
  Client.socket.emit('move-to-room', {room_id:room_id});
}

Client.send.takeItems = function(items) {
  var id_list = [];
  for (let item of items) {
    id_list.push(item.item_id);
  }

  Client.socket.emit('take-items', {item_ids:id_list});
}

Client.send.dropItems = function(items) {
  var id_list = [];
  for (let item of items) {
    id_list.push(item.item_id);
  }

  Client.socket.emit('drop-items', {item_ids:id_list});
}

Client.send.joinConversation = function(conversation) {
  Client.socket.emit('join-conversation', {conversation_id: conversation.conversation_id});
}

Client.send.leaveConversation = function(conversation) {
  Client.socket.emit('leave-conversation', {conversation_id: conversation.conversation_id});
}

Client.send.requestTrade = function(agent_id) {
  console.log("Requesting trade with agent " + agent_id);
  Client.socket.emit('request-trade', {agent_id: agent_id});
}

Client.send.acceptTrade = function(trade_id) {
  Client.socket.emit('accept-trade', {trade_id:trade_id});
}

Client.send.cancelTrade = function(trade_id) {
  Client.socket.emit('cancel-trade', {trade_id:trade_id});
}

Client.send.offerItemsTrade = function(trade_id, item_ids) {
  Client.socket.emit('offer-items-trade', {trade_id:trade_id, item_ids:item_ids});
}

Client.send.withdrawItemsTrade = function(trade_id, item_ids) {
  console.log("Trying to withdraw items " + trade_id + " : " + item_ids);
  Client.socket.emit('withdraw-items-trade', {trade_id:trade_id, item_ids:item_ids});
}

Client.send.readyTrade = function(trade_id, status) {
  Client.socket.emit('ready-trade', {trade_id:trade_id, ready_status:status});
}

Client.send.requestConversation = function(agent_id) {
  console.log("Requesting trade with agent " + agent_id);
  Client.socket.emit('request-conversation', {agent_id: agent_id});
}

Client.send.acceptConversation = function(agent_id) {
  console.log("Accepting trade with agent " + agent_id);
  Client.socket.emit('accept-conversation', {agent_id: agent_id});
}

