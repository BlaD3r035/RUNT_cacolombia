import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import RuntAuthModels from '../../models/Runt_auth_models.js'

export default {
    authLevel: 2,
    allServers: true,
    devOnly: false,
    data: new SlashCommandBuilder()
        .setName('añadir_roles_autorizados')
        .setDescription('Añade roles autorizados para usar comandos dentro de la institución')
        .addRoleOption(option => option
            .setName('role')
            .setDescription('Rol a autorizar')
            .setRequired(true)
        ),
    execute: async (interaction: any) => {
        const role = interaction.options.getRole('role')
        if (!role) return interaction.editReply('No se encontró el rol.')

      
        const roles = await RuntAuthModels.addRoles(interaction.guild.id, [role.id])

       
        const maxDisplay = 5
        const displayedRoles = roles.slice(0, maxDisplay).map(r => `<@&${r}>`)
        const remainingCount = roles.length - maxDisplay

        let description = displayedRoles.join(', ')
        if (remainingCount > 0) {
            description += `, y ${remainingCount} rol(es) más`
        }

        // Embed de confirmación
        const embed = new EmbedBuilder()
            .setTitle('✅ Rol autorizado agregado')
            .setDescription(`Se añadió el rol <@&${role.id}> a la lista de roles autorizados.`)
            .addFields({ name: 'Roles autorizados actuales', value: description || 'Ninguno' })
            .setColor('Green')
            .setFooter({
                text: 'RUNT CA COLOMBIA ERLC',
                iconURL: 'https://media.discordapp.net/attachments/1047946669079134249/1176943871595397172/Nuevo_Logo.png?ex=68c70165&is=68c5afe5&hm=292795090e996f2b079d274ac88d83240c9536ee929f6b0ee124cc074aaceadf&=&format=webp&quality=lossless&width=380&height=380',
            })
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] })
    }
}
