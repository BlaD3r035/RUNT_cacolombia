import licenses_requests_models from "../../models/licenses_requests_models.js";
import {EmbedBuilder, GuildMemberRoleManager, User, UserManager, WebhookClient} from 'discord.js'
import RuntAuthModels from "../../models/Runt_auth_models.js";
import ErrorEmbeds from "../../util/embeds/error_embeds.js";
import UsersModels from "../../models/users_models.js";
import LicensesModels from "../../models/licences_models.js";
import CoursesModels from "../../models/Courses_models.js";
import fetch from "node-fetch";
export default {
  name: "select_categories",
  match: (customId: string) => customId.startsWith("select_categories_"),

  run: async (interaction: any) => {
    try {
      
      if (!interaction.isStringSelectMenu()) return;
      
      const [, , request_id] = interaction.customId.split("_");
      const selectedCategories = interaction.values; 
      await interaction.deferUpdate(); 
      await interaction.editReply({content:"Cargando...", embeds:[],components:[],flags:64})
       const member = interaction.member;
                 if (!member || !("roles" in member))
                   return interaction.editReply("No se pudo obtener tus roles.");
             
                 const userRoles = (member.roles as GuildMemberRoleManager).cache.map(
                   (r) => r.id,
                 );
                 const hasRole = await RuntAuthModels.checkRoles(userRoles,interaction.guild.id);
                 if (!hasRole)
                   return interaction.editReply({
                     embeds: [
                       ErrorEmbeds.error(
                         "❌ No tienes los roles necesarios para usar este servicio.",
                       ),
                     ],
                     components:[]
                   });
             const discord_id = interaction.user.id
            const r = await UsersModels.getUserByDiscordId(discord_id)
             if(!r || r.length == 0 ){
                return interaction.editReply({embeds: [ErrorEmbeds.error('El Agente no tiene cedula')],components:[],})
             }
             const user_id = r[0].user_id
            const req = await licenses_requests_models.findRequestById(request_id)
            if(!req || req.length  == 0){
              return interaction.editReply({embeds:[ErrorEmbeds.error('No se encontró la solicitud')],flags: 64,components:[],})
            }
            if(req[0]!.status != "En revision"){
              return interaction.editReply({embeds:[ErrorEmbeds.error("Esta solicitud ya fue manejada")],components:[],flags:64})
            }
            const theoretical_test_id = req[0]!.theoretical_test_id;
            const course = await CoursesModels.getById(theoretical_test_id)
            if(!course || course.length == 0){
                return interaction.editReply({embeds:[ErrorEmbeds.error('No se encontró el test teorico')],flags: 64,components:[],})

            }
            const theoretical_test = course[0]
            const r_lice_check = await LicensesModels.getById(req[0]!.user_id)
            if(r_lice_check && r_lice_check.length > 0){
              return interaction.editReply({embeds:[ErrorEmbeds.error('El usuario ya tiene licencia')], flags:64,components:[],})
            }
            await LicensesModels.create(req[0]!.user_id,selectedCategories[0],theoretical_test!.restriction)
            await licenses_requests_models.changeRequestStatus(request_id, "Aprobado", user_id);
            try{

              await fetch(`https://api.cacolombia.com/users/${req[0]!.user_id}/license/register?type=${selectedCategories[0]}`)
            }catch(err){
              console.log(err)
            }
            const chnl_auth = await RuntAuthModels.getGuildAuth(interaction.guild.id)
            
            const channel_nots = interaction.guild.channels.cache.get(chnl_auth[0]!.channel_id)
            if(channel_nots){
              try{
               await channel_nots.send({
                content:`<@${r[0]!.discord_id}>`,
                embeds:[
                  new EmbedBuilder()
                  .setTitle("Se ha registrado una licencia")
                  .setColor("Green")
                  .addFields(
                    { name: "👤 Usuario", value: `CC: ${req[0]!.user_id}`, inline: false },
                    { name: "🪪 Categoría", value: selectedCategories[0], inline: true },
                    { name: "⚖️ Restricción", value: theoretical_test!.restriction || "Ninguna", inline: true },
                    { name: "📅 Fecha de aprobación", value: new Date().toLocaleDateString("es-CO"), inline: true },
                    { name: "👮 Agente", value: `<@${r[0].discord_id}>`, inline: false },
                  )
                  .setFooter({
                    text: 'RUNT CA COLOMBIA ERLC',
                    iconURL: 'https://media.discordapp.net/attachments/1047946669079134249/1176943871595397172/Nuevo_Logo.png?ex=68c70165&is=68c5afe5&hm=292795090e996f2b079d274ac88d83240c9536ee929f6b0ee124cc074aaceadf&=&format=webp&quality=lossless&width=380&height=380',
                  })
                  .setTimestamp()
                ]
               })
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

      await interaction.editReply({
        embeds: [
          {
            title: "✅ Solicitud aprobada",
            description: `Categorías seleccionadas:\n${selectedCategories[0]}`,
            color: 0x00ff00,
          },
        ],
        components: [],
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [ErrorEmbeds.error('Error aprovando la solicitud')],
        components:[],
        flags: 64,
      });
    }
  },
};
