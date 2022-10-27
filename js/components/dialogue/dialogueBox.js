import { dialogueData } from "./dialogueData";

// function to create dialogue box with text and author

export const enterDialogue = (scene, gameState, dialogueName) => {
  const centerOfCameraX = scene.cameras.main.worldView.centerX;
  const centerOfCameraY = scene.cameras.main.worldView.centerY;
  const dialogue = dialogueData.find((x) => x.name === dialogueName);

  // check player permissions to enter selected dialogue
  if (dialogue.playerCanTrigger) {
    gameState.active = false;

    // create graphics (box, text)
    let dialogueBox = scene.add.image(
      // selects center of camera view
      centerOfCameraX,
      centerOfCameraY + 100,
      "dialogue-box"
    );

    let authorText = scene.add.text(
      centerOfCameraX - 210,
      centerOfCameraY + 175,
      dialogue.messages[0].author
    );
    let messageText = scene.add.text(
      centerOfCameraX - 235,
      centerOfCameraY + 205,
      dialogue.messages[0].text
    );

    // set dephths so nothing is covering eachother
    messageText.setDepth(11);
    authorText.setDepth(11);
    dialogueBox.setScale(0.5);
    dialogueBox.setDepth(10);

    // function to destroy dialogue box and return to game
    function resumeGame() {
      messageText.destroy();
      authorText.destroy();
      dialogueBox.destroy();
      scene.anims.resumeAll();
      scene.physics.resume();
      gameState.cat.move.resume();
      gameState.active = true;
    }

    // cycle through messages and react accordingly
    let currentIndex = 0;

    scene.input.on("pointerup", function () {
      if (currentIndex < dialogue.messages.length - 1) {
        currentIndex++;
        authorText.setText(dialogue.messages[currentIndex].author);
        messageText.setText(dialogue.messages[currentIndex].text);
      } else {
        if (dialogue.onCompletion === "destroy") {
          resumeGame();
          // false if only want to play once
          dialogue.playerCanTrigger = true;
        }
      }
    });
  }
};
