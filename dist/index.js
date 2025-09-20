import dotenv from 'dotenv';
dotenv.config();
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js') || file.endsWith('.ts') && !file.endsWith('.d.ts'));
for (const file of commandFiles) {
    const filePathCommands = path.join(commandsPath, file);
    const command = await import(pathToFileURL(filePathCommands).href);
    client.commands.set(command.default.data.name, command.default);
}
const folderEventsPath = path.join(__dirname, 'events');
const eventsFolders = fs.readdirSync(folderEventsPath);
for (const folder in eventsFolders) {
    const eventsPath = path.join(folderEventsPath, folder);
    console.log(eventsPath);
    const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js') || file.endsWith('.ts') && !file.endsWith('.d.ts'));
}
client.login(process.env.DISCORD_BOT_TOKEN);
//# sourceMappingURL=index.js.map