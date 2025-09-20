import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  GuildMemberRoleManager,
  MessageFlags,
} from "discord.js";
import RuntAuthModels from "../../models/Runt_auth_models.js";
import ErrorEmbeds from "../../util/embeds/error_embeds.js";
import licenses_requests_models from "../../models/licenses_requests_models.js";
import Containers from "../../util/containers/licenses_containers.js";

export default {
  authLevel: 1,
  allServers: true,
  devOnly: false,
  data: new SlashCommandBuilder()
    .setName("ver-solicitudes-licencia")
    .setDescription("Ver todas las solicitudes de licencia"),

  execute: async (interaction: ChatInputCommandInteraction) => {
    
    const guild_id = interaction.guild!.id;
    const r = await RuntAuthModels.getAuthType(guild_id);
    if (r != "Secretaria") {
      return interaction.editReply({
        embeds: [ErrorEmbeds.error("Solo secretaría puede usar este comando")],
      });
    }

    const member = interaction.member;
    if (!member || !("roles" in member))
      return interaction.editReply("No se pudo obtener tus roles.");
    const userRoles = (member.roles as GuildMemberRoleManager).cache.map(
      (r) => r.id,
    );
    const hasRole = await RuntAuthModels.checkRoles(userRoles, guild_id);
    if (!hasRole){
      return interaction.editReply({
        embeds: [
          ErrorEmbeds.error(
            "❌ No tienes los roles necesarios para usar este comando.",
          ),
        ],
      });
    }

    const requests = await licenses_requests_models.findRequests("En revision");
    if (!requests || requests.length == 0) {
      return interaction.editReply({
        embeds: [ErrorEmbeds.error("No existen solicitudes pendientes")],
      });
    }

  const components = await Containers.buildLicenseRequestsComponents(requests as any, 0);

await interaction.editReply({
  flags: MessageFlags.IsComponentsV2,
  components, 
});
  },
};
