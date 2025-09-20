import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder, GuildMemberRoleManager,
} from "discord.js";
import RuntAuthModels from "../../models/Runt_auth_models.js";
import licenses_requests_models from "../../models/licenses_requests_models.js";
import UsersModels from "../../models/users_models.js";
import ErrorEmbeds from "../../util/embeds/error_embeds.js";
export default {
  name: "manage_license",
  description: "Muestra información detallada de una solicitud de licencia",
  match: (customId: string) => customId.startsWith("manage_license_"),

  run: async (interaction: any) => {
    try {
      const [, , page, index, request_id] = interaction.customId.split("_");
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
              ], flags: 64,
            });

      const request = await licenses_requests_models.findRequestById(request_id);
      if (!request || request.length === 0) {
        return interaction.reply({
          embeds:[ErrorEmbeds.error('No se encontró la solicitud')],
          flags: 64,
        });
      }

      const r: any = request[0];
      if(r.status != "En revision"){
        return interaction.reply({embeds:[ErrorEmbeds.error('Esta solicitud ya fue manejada')],flags:64})
      }
      const user = await UsersModels.getUserById(r.user_id);

 
      const embed = new EmbedBuilder()
        .setTitle("📄 Detalles de la Solicitud de Licencia")
        .setColor(0x0099ff)
        .setDescription(
          [
            `**ID:** \`${r.request_id}\``,
            `**Usuario:** ${
              user?.discord_id ? `<@${user.discord_id}>` : `ID: ${r.user_id}`
            }`,
            `**Nombre / NUIP:** ${user.first_names} ${user.last_names} CC:${user.user_id}`,
            `**Certificado curso Teorico:**  https://app.cacolombia.com/pdfs/cursos/${r.theoretical_test_id}.pdf`,
            `**Certificado curso practico:** https://app.cacolombia.com/pdfs/cursos/${r.practical_test_id}.pdf`,
            `**Estado actual:** ${r.status}`,
            `**Fecha de creación:** ${new Date(
              r.created_at,
            ).toLocaleString()}`,
          ].join("\n"),
        );

     
      const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`approve_license_${r.request_id}`)
          .setLabel("✅ Aprobar")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`reject_license_${r.request_id}`)
          .setLabel("❌ Rechazar")
          .setStyle(ButtonStyle.Danger),
       
      );

    
      await interaction.reply({
        embeds: [embed],
        components: [actionRow],
        flags: 64, 
      });
    } catch (err) {
      console.error("Error mostrando la solicitud:", err);
      await interaction.reply({
        embeds: [ErrorEmbeds.error('No se pudo cargár la información de la solicitud')],
        flags: 64,
      });
    }
  },
};
