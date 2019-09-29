import { ClientAPI } from "../../core/panoptykClientAPI";

export class Login extends Phaser.State {
  private ready: boolean;
  private spaceKey: Phaser.Key;

  public create(): void {
    this.game.add.plugin(new PhaserInput.Plugin(this.game, this.game.plugins));
    const user = this.game.add.inputField(90, 10);
    user.setText("phaser_man1");
    const pass = this.game.add.inputField(90, 30, {
        type: PhaserInput.InputType.password
    });

    this.spaceKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.spaceKey.onDown.add(() => {
      ClientAPI.login(user.value, pass.value)
        .then(res => {
            console.log("Success! " + ClientAPI.playerAgent);
            user.destroy();
            pass.destroy();
            this.ready = true;
        })
        .catch(err => console.log("fail!"));
    });
  }

  public update(): void {
    if (this.ready === true) {
      this.game.state.start("Game");
    }
  }
}
