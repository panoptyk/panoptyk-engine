import fs = require('fs');
import { logger } from "../utilities/logger";
import { panoptykSettings } from "../utilities/util"


export default class Trade {
  private static nextId = 1;
  private static objects = new Map();
  private static actives = new Set();

  private id: number;
  private agent_ini: number;
  private agent_res: number;
  private conversation: number;
  private result_status: number;
  private items_ini: number[];
  private items_res: number[];
  private status_ini: boolean;
  private status_res: boolean;


  /**
   * Trade model.
   * @param {int} agent_ini - initiating agent id
   * @param {int} agent_res - responding agent id
   * @param {int} conversation - id of conversation trade is happening in.
   * @param {int} id - id of trade. If null, one will be assigned.
   * @param {int} result_status - result status of trade.
   *              0=failed, 1=success, 2=in progress, 3=requested
   */
  constructor(agent_ini, agent_res, conversation, id=null, result_status=3) {
    this.agent_ini = agent_ini;
    this.agent_res = agent_res;
    this.conversation = conversation;
    this.result_status = result_status;

    this.items_ini = [];
    this.items_res = [];

    this.status_ini = false;
    this.status_res = false;

    this.id = id == null ? Trade.nextId++ : id;
    Trade.objects[this.id] = this;

    if (this.result_status == 3) {
      Trade.actives.add(this.id);
    }

    logger.log('Trade ' + this.id + ' Initialized.', 2);
  }


  /**
   * Load a trade JSON into memory.
   * @param {JSON} data - serialized trade object.
   */
  static load(data) {
    new Trade(data.agent_ini_id,
              data.agent_res_id,
              data.conversation_id,
              data.id,
              data.result_status);

  }


  /**
   * Serialize this trade object into a JSON object.
   * @return {JSON}
   */
  serialize() {
    var data = {
      id: this.id,
      agent_ini_id: this.agent_ini,
      agent_res_id: this.agent_res,
      conversation_id: this.conversation,
      result_status: this.result_status
    }

    return data;
  }


  /**
   * Serialize all trades and save them to files.
   */
  static save_all() {
    logger.log("Saving trades...", 2);

    for (var id in Trade.objects) {
      var trade = Trade.objects[id];
      logger.log("Saving trade " + trade.id, 2);

      fs.writeFileSync(panoptykSettings.data_dir + '/trades/trade_'
        + trade.id + '.json',
        JSON.stringify(trade.serialize()), 'utf8');
    }

    logger.log("Trades saved.", 2);
  }


  /**
   * Load all trades from file into memory.
   */
  static load_all() {
    logger.log("Loading trades...", 2);

    fs.readdirSync(panoptykSettings.data_dir + '/trades/').forEach(function(file) {
      fs.readFile(panoptykSettings.data_dir +
        '/trades/' + file, function read(err, data) {

        if (err) {
          logger.log(err);
          return;
        }

        var json = JSON.parse(data.toString());
        logger.log("Loading trade " + json.id, 2);
        Trade.load(json);
      });
    });
  }


  /**
   * Get item data for an agent in the trade.
   * @param {Object} agent - agent object.
   * @returns [Object] list of item data dictionaries.
   */
  get_agent_items_data(agent) {
    let data = [];

    if (agent == this.agent_ini || agent == this.agent_res) {
      for (let item of agent == this.agent_ini ? this.items_ini : this.items_res) {
        //TODO data.push(item.get_data());
      }
    }
    else {
      logger.log("No matching agent for trade item data.", 0, 'trade.js');
    }

    return data;
  }


  /**
   * Get 'ready-to-send' data to send to client.
   * @returns {Object}
   */
  get_data() {
    return {
      'id': this.id,
      'agent_ini_id': this.agent_ini,
      'agent_res_id': this.agent_res,
      'items_ini': this.items_ini,
      'items_res': this.items_res,
      'conversation_id': this.conversation,
      'result_status': this.result_status
    }
  }


  /**
   * Set status of trade.
   * 0=failed, 1=success, 2=in progress, 3=requested
   * @param {int} stat - status to set.
   */
  set_status(stat) {
    this.result_status = stat;
  }


  /**
   * Set an agent's ready status.
   * @param {Object} agent - agent to set status for.
   * @param {boolean} rstatus - status. True = ready, false = not ready.
   */
  set_agent_ready(agent, rstatus) {
    if (agent == this.agent_ini) {
      this.status_ini = rstatus;
    }
    else if(agent == this.agent_res) {
      this.status_res = rstatus;
    }

    return this.status_ini && this.status_res;
  }


  /**
   * Add items to one side of the trade.
   * @param {[Object]} items - items to add to trade.
   * @param {Object} owner - agent object of agent adding the items.
   */
  add_items(items, owner) {
    if (owner == this.agent_ini) {
      this.items_ini.push(...items);
    }
    else if (owner == this.agent_res) {
      this.items_res.push(...items);
    }
    else {
      logger.log("Agent not in trade", 0, "trade.js");
      return;
    }

    for (let item of items) {
      item.in_transaction = true;
    }
  }


  /**
   * Remove items from one side of the trade.
   * @param {[Object]} items - items to remove from trade.
   * @param {Object} owner - agent object of agent removing the items.
   */
  remove_items(items, owner) {
    if (owner == this.agent_ini) {
      this.items_ini = this.items_ini.filter(function(x) {
        return items.indexOf(x) < 0;
      });
    }
    else if (owner == this.agent_res) {
      this.items_res = this.items_res.filter(function(x) {
        return items.indexOf(x) < 0;
      });
    }
    else {
      logger.log("Agent not in trade", 0, "trade.js");
      return;
    }

    for (let item of items) {
      item.in_transaction = false;
    }
  }


  /**
   * Call when trade is over, nomatter if it was successful or not.
   * Unlocks all the items in the trade and removes it from the active trade list.
   */
  // cleanup() { TODO
  //   var unlocked = '';

  //   for (let item of this.items_ini) {
  //     item.in_transaction = false;
  //     unlocked += item.item_id + " ";
  //   }

  //   for (let item of this.items_res) {
  //     item.in_transaction = false;
  //     unlocked += item.item_id + " ";
  //   }

  //   Trade.actives.splice(Trade.actives.indexOf(this), 1);

  //   logger.log("Unlocked trade " + this.id + " items [ " + unlocked + "]", 2);
  // }


  /**
   * Find a trade by its id.
   * @param {int} id - trade id
   * @return {Object/null}
   */
  static get_trade_by_id(id) {
    if (Trade.objects[id] != undefined) {
      return Trade.objects[id];
    }

    logger.log('Could not find trade with id ' + id + '.', 0, 'trade.js');
    return null;
  }


  /**
   * Get all the trade objects with this agent.
   * @param {Object} agent - agent to find trades for.
   * @return [trade]
   */
  static get_active_trades_with_agent(agent) {
    var trades = [];

    // for (let trade of Trade.actives) {  TODO
    //   if (trade.agent_ini == agent || trade.agent_res == agent) {
    //     trades.push(trade);
    //   }
    // }

    return trades;
  }
}
