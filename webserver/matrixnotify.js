// Import necessary modules
import { AutojoinRoomsMixin, MatrixClient } from "matrix-bot-sdk";
import fs from "fs/promises";
import { log } from './logging.js';

export default async function notify( message ) {

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
    log.trace("Matrix client started.");

    // Send a text message to the specified room
    await client.sendMessage(config.room, {
      msgtype: "m.text",
      body: message,
    });

    log.debug("Message sent successfully.");

  } catch (error) {

    log.error("Error:", error);

  } finally {

    // Make sure to stop the client when done
    if (client) {
      await client.stop();
      log.trace("Matrix client stopped.");
    }
  }
}
