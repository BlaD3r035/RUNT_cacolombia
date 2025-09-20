import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,GuildMemberRoleManager,
  EmbedBuilder,
} from "discord.js";
import ErrorEmbeds from "../../util/embeds/error_embeds.js";
import RuntAuthModels from "../../models/Runt_auth_models.js";
export default {
  name: "approve_license",
  description: "Aprueba una solicitud y selecciona categorías",
  match: (customId: string) => customId.startsWith("approve_license_"),

  run: async (interaction: any) => {
    try {
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
        .setTitle("✅ Aprobar Solicitud")
        .setDescription(
          "Selecciona la categoria de licencia."
        )
        .setColor(0x00ff00);

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`select_categories_${request_id}`)
        .setPlaceholder("Selecciona categorías...")
        .setMinValues(1)
        .setMaxValues(1) 
        .addOptions([
          { label: "A1", value: "A1" },
          { label: "A2", value: "A2" },
          { label: "B1", value: "B1" },
          { label: "B2", value: "B2" },
          { label: "B3", value: "B3" },
          { label: "C1", value: "C1" },
          { label: "C2", value: "C2" },
          { label: "C3", value: "C3" },
  
        ]);

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

      await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true, 
      });
      if (interaction.message && !interaction.message.deleted) {
       await interaction.message.delete().catch(() => null); 
}
    } catch (err) {
      console.error(err);
      await interaction.reply({
        embeds: [ErrorEmbeds.error("❌ No se pudo iniciar el proceso de aprobación")],
        flags: 64,
      });
    }
  },
};
