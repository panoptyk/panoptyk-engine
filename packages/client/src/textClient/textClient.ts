export type ActionFunction = (args: string[]) => any;

export class TextClient {
  _commands: Command[] = [];

  _result = "";
  _viewed = true;
  _buffer: string[] = [];

  addCommand(
    names: string | string[],
    numArgs: number[],
    func: ActionFunction
  ) {
    if (!Array.isArray(names)) {
      names = [names];
    }
    // TODO: check if command word already used
    this._commands.push(new Command(names, numArgs, func));
  }

  inputCommand(cmd: string) {
    if (!this._viewed) {
      this._buffer.push(cmd);
      return;
    }
    const split: string[] = cmd.split(" ").map((str) => str.replace("_", " "));
    const action: ActionFunction = this.getCommand(split[0], split.length - 1);
    if (action !== undefined) {
      action.call(this, split.slice(1));
    } else {
      this._result = undefined;
    }
    this._viewed = false;
  }

  getCommand(commandName: string, numParamaters: number): ActionFunction {
    for (let i = 0; i < this._commands.length; i++) {
      if (
        this._commands[i].validCommandName(commandName) &&
        this._commands[i].validNumParameters(numParamaters)
      ) {
        return this._commands[i].getAction();
      }
    }

    return undefined;
  }

  getResult(): string {
    this._viewed = true;
    const result = this._result;
    if (this._buffer.length > 0) {
      const c = this._buffer[0];
      this._buffer = this._buffer.slice(1);
      this.inputCommand(c);
    }
    return result;
  }

  doBuffer() {}
}

class Command {
  _commandName: string[];
  _numParameters: number[];
  _action: ActionFunction;

  constructor(cn: string[], np: number[], a: ActionFunction) {
    this._commandName = cn;
    this._numParameters = np;
    this._action = a;
  }

  validCommandName(s: string) {
    return this._commandName.indexOf(s) !== -1;
  }

  validNumParameters(n: number): boolean {
    return (
      this._numParameters.length === 0 || this._numParameters.indexOf(n) !== -1
    );
  }

  getAction(): ActionFunction {
    return this._action;
  }
}
