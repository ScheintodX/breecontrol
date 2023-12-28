// Import necessary modules
import { AutojoinRoomsMixin, MatrixClient } from "matrix-bot-sdk";
import fs from "fs/promises";

async function main() {
  let client;
  try {
    // Load the configuration from matrixconf.json
    const configFile = await fs.readFile("matrixconf.json", "utf-8");
    const config = JSON.parse(configFile);

    // Initialize the Matrix client
    client = new MatrixClient(config.server, config.token);

    // Mix in the auto-join functionality to automatically join rooms
    AutojoinRoomsMixin.setupOnClient(client);

    await client.start();
    console.log("Matrix client started.");

    // Replace this line with the message you want to send
    const message = "Hello, Matrix!";

    // Send a text message to the specified room
    await client.sendMessage(config.room, {
      msgtype: "m.text",
      body: message,
    });

    console.log("Message sent successfully.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Make sure to stop the client when done
    if (client) {
      await client.stop();
      console.log("Matrix client stopped.");
    }
  }
}

main();
