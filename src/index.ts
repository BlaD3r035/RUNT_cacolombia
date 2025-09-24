import dotenv from 'dotenv';
dotenv.config();
import { Client, GatewayIntentBits, Events, Collection, REST, Routes, PermissionsBitField, GuildMember} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL} from 'url';
import AuthEmbeds from './util/embeds/auth_embeds.js'
import RuntAuthModels from './models/Runt_auth_models.js';
import ErrorEmbeds from './util/embeds/error_embeds.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,  
  ],
});
// commands
client.commands = new Collection();

const folderCommandsPath = path.join(__dirname, 'commands')
const commandsFolders = fs.readdirSync(folderCommandsPath);
for (const folder of commandsFolders){
    const commandsPath = path.join(folderCommandsPath, folder);
    const commandsFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js') ||file.endsWith('.ts')&& !file.endsWith('.d.ts'));
    for (const file of commandsFiles){
       const filePath = path.join(commandsPath, file);
       const commandImport  = await import(pathToFileURL(filePath).href)
       const command = commandImport.default
       if('data' in command && 'execute' in command && 'authLevel' in command && 'allServers' in command && 'devOnly' in command){
        client.commands.set(command.data.name ,command)
       }else{
         console.error(`[WARNING] The command ${filePath} is missing required "data", "execute", "authLevel", "allServers", "devOnly" properly`)

       }
       
    }
}
console.table(
  client.commands.map(cmd =>({
    Name: cmd.data.name,
    Description: cmd.data.description,
    AuthLevel: cmd.authLevel,
    AllServers: cmd.allServers,
    DevOnly: cmd.devOnly
  }))
)
// push commands

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN as string);

(async () => {
  try {
    const allServersCommands = client.commands
      .filter(c => c.allServers || !c.allServers)
      .map(c => c.data.toJSON());

    if (allServersCommands.length > 0) {
      await rest.put(
        Routes.applicationCommands(process.env.DISCORD_BOT_ID as string),
        { body: allServersCommands }
      );
      console.log(`✅ Global commands registered: ${allServersCommands.length}`);
    } else {
      console.log("ℹ️ No global commands to register");
    }
  } catch (error: any) {
    console.error("❌ Error registering global commands:", error?.rawError || error);
  }

 
})();


// events
  client.buttons = new Collection();

const folderEventsPath = path.join(__dirname, 'events')
const eventsFolders = fs.readdirSync(folderEventsPath);

for (const folder of eventsFolders) {
  const eventsPath = path.join(folderEventsPath, folder);

  
  if (folder === "buttons") {
    const buttonFiles = fs
      .readdirSync(eventsPath)
      .filter(
        (file) => file.endsWith(".js") || (file.endsWith(".ts") && !file.endsWith(".d.ts"))
      );

    for (const file of buttonFiles) {
      const filePath = path.join(eventsPath, file);
      const buttonImport = await import(pathToFileURL(filePath).href);
      const button = buttonImport.default;

      if ("match" in button && typeof button.match === "function" && "run" in button) {
        client.buttons.set(file.replace(/\.(js|ts)$/, ""), button);
      } else {
        console.warn(`[WARNING] El botón ${file} no tiene "match" o "run" válidos.`);
      }
    }

    console.log(`✅ Cargados ${client.buttons.size} botones.`);
    continue; 
  }

  // --- Eventos normales ---
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js") || (file.endsWith(".ts") && !file.endsWith(".d.ts")));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const eventImport = await import(pathToFileURL(filePath).href);
    const event = eventImport.default;

    if (!event.name || !event.execute) {
      console.warn(`[WARNING] El evento ${file} no tiene "name" o "execute".`);
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}
console.table(
  client.buttons.map(btn => ({
    Name: btn.name,
    Description: btn.description ?? "—",
    Pattern: btn.match.toString().replace(/\s+/g, " "), 
  }))
);


// comands execute

client.on(Events.InteractionCreate, async (interaction) =>{
  
   // autocomplete
   if(interaction.isAutocomplete()){
      const command = client.commands.get(interaction.commandName)
      if(!command || !command.autocomplete) return
      try{
        await command.autocomplete(interaction)
      }catch(error){
        console.log('Autocomplete Error')
      }

   }
   if (interaction.isButton() || interaction.isStringSelectMenu()) {
 
  const button = [...interaction.client.buttons.values()].find((btn) =>
    btn.match(interaction.customId)
  );

  if (!button) {
   
    return interaction.reply({
      embeds:[ErrorEmbeds.error('Este boton no existe o ya expiró')]
    });
  }

  try {
    await button.run(interaction);
  } catch (err) {
    console.error(`Error en botón ${interaction.customId}:`, err);
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({
        content: "⚠️ Ocurrió un error al ejecutar este botón.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "⚠️ Ocurrió un error al ejecutar este botón.",
        ephemeral: true,
      });
    }
  }
}
 

   if(!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) return
   const command = interaction.client.commands.get(interaction.commandName)
   if(!command){
     return console.error('No command matching ' + interaction.commandName + " was found")
   }
   
   if( command.devOnly && interaction.user!.id  != process.env.DISCORD_DEV_ID ){
      return interaction.reply({embeds:[AuthEmbeds.devOnly()]})
   }
    const e = await RuntAuthModels.getGuildAuth(interaction.guild!.id)
    let auth;
    if( e.length > 0 ){
      auth = e[0]
    }
    if(command.authLevel > 0 && interaction.commandName != 'configurar_canal_notificaciones'){
      if(!auth || !auth!.channel_id){
        return interaction.reply({embeds:[AuthEmbeds.noChannel()]})
      }
    }
    switch(command.authLevel){
      case 1:
        if(auth && auth.auth == 1 ){
           break;
        }else{
          return interaction.reply({embeds:[AuthEmbeds.noPerms(["Guild autorizado"])]})
        }
       
      case 2:
        if(auth && auth.auth == 1 ){
          const guildMember = interaction.member as GuildMember;
          if(!guildMember.permissions.has(PermissionsBitField.Flags.Administrator) ){
            return interaction.reply({embeds:[AuthEmbeds.noPerms(["Guild autorizado","Permisos de administrador en la guild"])]})
          }
          break
        }else{
       
          return interaction.reply({embeds:[AuthEmbeds.noPerms(["Guild autorizado","Permisos de administrador en la guild"])]})
        }
      case 3:
        if(interaction.guild!.id == process.env.DISCORD_PRINCIPAL_GUILD_ID as string){
          const guildMember = interaction.member as GuildMember;
          if(!guildMember.permissions.has(PermissionsBitField.Flags.Administrator) ){
            return interaction.reply({embeds:[AuthEmbeds.noPerms(["Guild principal", "Permisos de administrador en la guild"])]})
          }
          break

        }else{
          return interaction.reply({embeds:[AuthEmbeds.noPerms(["Guild principal", "Permisos de administrador en la guild"])]})
        }
    }

    try{
        await interaction.deferReply()
        console.log(` executing the command ${interaction.commandName} in ${interaction.guild?.name} by ${interaction.user.username}.`)
         await command.execute(interaction)
     }catch(error){
       console.log(`Error executing the command ${interaction.commandName} in ${interaction.guild?.name} by ${interaction.user.username}. Error:` + error)
       const errorMessage = error instanceof Error ? error.message : String(error)
       if (interaction.deferred) {
    await interaction.editReply({ embeds:[ErrorEmbeds.error(errorMessage)] })
  } else if (!interaction.replied) {
    await interaction.reply({ embeds:[ErrorEmbeds.error(errorMessage)] })
  }
      }



})


client.login(process.env.DISCORD_BOT_TOKEN);

