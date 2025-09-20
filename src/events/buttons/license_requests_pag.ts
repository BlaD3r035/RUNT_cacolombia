import Containers from "../../util/containers/licenses_containers.js";
import licenses_requests_models from "../../models/licenses_requests_models.js";
import RuntAuthModels from "../../models/Runt_auth_models.js";
import ErrorEmbeds from "../../util/embeds/error_embeds.js";
import {GuildMemberRoleManager} from 'discord.js'
export default {
  name: "licenses_pagination",
  description: "Maneja los botones de paginación en la lista de solicitudes de licencia",

  match: (customId: any) =>
    customId.startsWith("licenses_prev_") || customId.startsWith("licenses_next_"),

  run: async (interaction: any) => {
    try {
      const [, , pageStr] = interaction.customId.split("_");
      const newPage = parseInt(pageStr, 10);
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

      // Usa tu modelo directamente
      const requests = await licenses_requests_models.findRequests("En revision");

      const components = await Containers.buildLicenseRequestsComponents(
        requests as any,
        newPage
      );

      await interaction.update({ components });

    } catch (err) {
      console.error("Error manejando paginación:", err);
      await interaction.reply({
        content: "❌ Ocurrió un error al cambiar de página.",
        flags: 64, 
      });
    }
  },
};
