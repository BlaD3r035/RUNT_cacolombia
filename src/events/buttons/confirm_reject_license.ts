import licenses_requests_models from "../../models/licenses_requests_models.js";
import RuntAuthModels from "../../models/Runt_auth_models.js";
import ErrorEmbeds from "../../util/embeds/error_embeds.js";
import {GuildMemberRoleManager, EmbedBuilder, WebhookClient} from 'discord.js'
import UsersModels from "../../models/users_models.js";
export default {
  name: "confirm_reject",
  match: (customId: string) =>
    customId.startsWith("confirm_reject_") || customId.startsWith("cancel_reject_"),

  run: async (interaction: any) => {
    const [action, , request_id] = interaction.customId.split("_");
    const member = interaction.member;
              if (!member || !("roles" in member))
                return interaction.reply("No se pudo obtener tus roles.");
          
              const userRoles = (member.roles as GuildMemberRoleManager).cache.map(
                (r) => r.id,
              );
              const hasRole = await RuntAuthModels.checkRoles(userRoles,interaction.guild.id);
              if (!hasRole)
                return interaction.reply({
                  embeds: [
                    ErrorEmbeds.error(
                      "❌ No tienes los roles necesarios para usar este servicio.",
                    ),
                  ],
                });

    if (action === "confirm") {
        const discord_id = interaction.user.id
                    const r = await UsersModels.getUserByDiscordId(discord_id)
                     if(!r || r.length == 0 ){
                        return interaction.update({embeds: [ErrorEmbeds.error('El Agente no tiene cedula')]})
                     }
                     const user_id = r[0].user_id
        const req : any = await licenses_requests_models.findRequestById(request_id)
        if(!req || req.length == 0){
          return interaction.update({embeds:[ErrorEmbeds.error("No existe esta solicitud")]})
        }
       if(req[0]!.status != "En revision"){
                    return interaction.update({embeds:[ErrorEmbeds.error("Esta solicitud ya fue manejada")],components:[],flags:64})
                  }
      await licenses_requests_models.changeRequestStatus(request_id, "Denegado", user_id);
      const chnl_auth = await RuntAuthModels.getGuildAuth(interaction.guild.id)
                  
                  const channel_nots = interaction.guild.channels.cache.get(chnl_auth[0]!.channel_id)
                  if(channel_nots){
                    try{
                     await channel_nots.send({
                      content: `<@${r[0]!.discord_id}>`, 
                      embeds: [
                        new EmbedBuilder()
                          .setTitle("❌ Solicitud de licencia rechazada")
                          .setColor("Red")
                          .setDescription("Una solicitud de licencia de conducción ha sido rechazada por el sistema.")
                          .addFields(
                            { name: "👤 Usuario", value: `CC: ${req[0]!.user_id}`, inline: false },
                            { name: "📅 Fecha de revisión", value: new Date().toLocaleDateString("es-CO"), inline: true },
                            { name: "👮 Agente responsable", value: `<@${r[0].discord_id}>`, inline: false },
                            { name: "⚠️ Motivo del rechazo", value: "El usuario no cumple con los requisitos establecidos.", inline: false }
                          )
                          .setFooter({
                          text: "RUNT CA COLOMBIA ERLC",
                          iconURL:
                            "https://media.discordapp.net/attachments/1047946669079134249/1176943871595397172/Nuevo_Logo.png?ex=68c70165&is=68c5afe5&hm=292795090e996f2b079d274ac88d83240c9536ee929f6b0ee124cc074aaceadf&=&format=webp&quality=lossless&width=380&height=380",
                          })
                          .setTimestamp(),
                      ],
                    });
                    }catch(err){
      
                    }
                  }
        if (process.env.DISCORD_PRINCIPAL_GUILD_WEBHOOK) {
                const webhookClient = new WebhookClient({ url: process.env.DISCORD_PRINCIPAL_GUILD_WEBHOOK });
                const publicEmbed = new EmbedBuilder()
                  .setTitle("📄 Estado de solicitud actualizado")
                  .setDescription(`Tu solicitud de licencia ha sido actualizada.\nPuedes consultar su estado en la página oficial del RUNT.`)
                  .setColor("Blue")
                  .setFooter({
                            text: 'RUNT CA COLOMBIA ERLC',
                            iconURL: 'https://media.discordapp.net/attachments/1047946669079134249/1176943871595397172/Nuevo_Logo.png?ex=68c70165&is=68c5afe5&hm=292795090e996f2b079d274ac88d83240c9536ee929f6b0ee124cc074aaceadf&=&format=webp&quality=lossless&width=380&height=380',
                          })
                  .setTimestamp();
                const userinfo = await UsersModels.getUserById(req[0]!.user_id)
                await webhookClient.send({content:`<@${userinfo.discord_id}>`, embeds: [publicEmbed] });
              }
      await interaction.update({
        embeds: [{ title: "❌ Solicitud rechazada", color: 0xff0000 }],
        components: [],
      });
    } else {
      await interaction.update({
        embeds: [{ title: "✅ Acción cancelada", color: 0x00ff00 }],
        components: [],
      });
    }
  },
};
