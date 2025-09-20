import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js'
import RuntAuthModels from '../../models/Runt_auth_models.js'

export default {
    authLevel: 2,
    allServers: true,
    devOnly: false,
    data: new SlashCommandBuilder()
        .setName('eliminar_roles_autorizados')
        .setDescription('Elimina roles autorizados para usar comandos dentro de la institución')
        .addStringOption(option =>
            option
                .setName('role')
                .setDescription('Rol a eliminar')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    autocomplete: async (interaction: AutocompleteInteraction) => {
        const focusedValue = interaction.options.getFocused().toLowerCase()
        const guildId = interaction.guild?.id
        if (!guildId) return interaction.respond([])

        const savedRoles = await RuntAuthModels.getRoles(guildId)

        const filtered = savedRoles
            .map(rId => {
                const role = interaction.guild?.roles.cache.get(rId)
                if (!role) return null
                return { name: role.name, value: role.id }
            })
            .filter(Boolean)
            .filter(r => r!.name.toLowerCase().includes(focusedValue))
            .slice(0, 25) 

        await interaction.respond(filtered as { name: string, value: string }[])
    },

    execute: async (interaction: ChatInputCommandInteraction) => {
        const roleId = interaction.options.getString('role')
        if (!roleId) return interaction.editReply('No se encontró el rol.')

        const role = interaction.guild?.roles.cache.get(roleId)
        if (!role) return interaction.editReply('Rol no válido en esta guild.')


        const roles = await RuntAuthModels.removeRoles(interaction.guild!.id, [role.id])

        const maxDisplay = 5
        const displayedRoles = roles.slice(0, maxDisplay).map(r => {
            const rl = interaction.guild?.roles.cache.get(r)
            return rl ? `<@&${rl.id}>` : r
        })
        const remainingCount = roles.length - maxDisplay

        let description = displayedRoles.join(', ')
        if (remainingCount > 0) description += `, y ${remainingCount} rol(es) más`

        const embed = new EmbedBuilder()
            .setTitle('🗑️ Rol autorizado eliminado')
            .setDescription(`Se eliminó el rol <@&${role.id}> de la lista de roles autorizados.`)
            .addFields({ name: 'Roles autorizados actuales', value: description || 'Ninguno' })
            .setColor('Red')
            .setFooter({
                text: 'RUNT CA COLOMBIA ERLC',
                iconURL: 'https://media.discordapp.net/attachments/1047946669079134249/1176943871595397172/Nuevo_Logo.png?ex=68c70165&is=68c5afe5&hm=292795090e996f2b079d274ac88d83240c9536ee929f6b0ee124cc074aaceadf&=&format=webp&quality=lossless&width=380&height=380',
            })
            .setTimestamp()

        return interaction.editReply({ embeds: [embed] })
    }
}
