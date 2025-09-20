import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import ErrorEmbeds from "../../util/embeds/error_embeds.js";
import RuntAuthModels from "../../models/Runt_auth_models.js";
import {GuildMemberRoleManager} from 'discord.js'
export default {
  name: "reject_license",
  match: (customId: string) => customId.startsWith("reject_license_"),

  run: async (interaction: any) => {
    const [, , request_id] = interaction.customId.split("_");
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

    const embed = new EmbedBuilder()
      .setTitle("❌ Confirmar Rechazo")
      .setDescription("¿Estás seguro de que quieres rechazar esta solicitud?")
      .setColor(0xff0000);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_reject_${request_id}`)
        .setLabel("Sí, rechazar")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`cancel_reject_${request_id}`)
        .setLabel("Cancelar")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
    if (interaction.message && !interaction.message.deleted) {
        await interaction.message.delete().catch(() => null); 
}
  },
};
