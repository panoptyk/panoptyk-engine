import { ClientAPI } from "../../core/panoptykClientAPI";

export class Login extends Phaser.State {
  private ready: boolean;

  public create(): void {
    const inputFieldHeight = 20;
    const inputFieldWidth = 200;

    this.game.add.plugin(new PhaserInput.Plugin(this.game, this.game.plugins));

    const userField = this.game.add.inputField(this.game.world.centerX - 100, this.game.world.height / 4 - 16, {
      type: PhaserInput.InputType.text,
      placeHolder: "username",
      font: "18px Space Mono",
      width: inputFieldWidth,
      height: inputFieldHeight
    });

    const passwordField = this.game.add.inputField(this.game.world.centerX - 100, this.game.world.height / 4 + 16, {
        type: PhaserInput.InputType.password,
        placeHolder: "password",
        font: "18px Space Mono",
        width: inputFieldWidth,
        height: inputFieldHeight
    });

    const login = () => {ClientAPI.login(userField.value, passwordField.value)
      .then(res => {
          console.log("Success! " + ClientAPI.playerAgent);
          userField.destroy();
          passwordField.destroy();
          button.destroy();
          this.ready = true;
      })
      .catch(err => console.log("fail!"));
    };

    const button = this.game.add.button(this.game.world.centerX - 95, this.game.world.height / 4 + 52, "button", login, this, 2, 1, 0);
  }

  public update(): void {
    if (this.ready === true) {
      this.game.state.start("Game");
    }
  }
}
