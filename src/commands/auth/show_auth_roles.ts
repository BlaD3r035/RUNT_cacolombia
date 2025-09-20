import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js'
import RuntAuthModels from '../../models/Runt_auth_models.js'

export default {
    authLevel: 1,
    allServers: true,
    devOnly: false,
    data: new SlashCommandBuilder()
        .setName('listar_roles_autorizados')
        .setDescription('Muestra los roles autorizados para usar comandos dentro de la institución'),

    execute: async (interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guild?.id
        if (!guildId) return interaction.editReply('Guild no válida.')

        
        const roles = await RuntAuthModels.getRoles(guildId)

        if (roles.length === 0) {
            return interaction.editReply('No hay roles autorizados configurados para esta guild.')
        }

        const maxDisplay = 30
        const displayedRoles = roles.slice(0, maxDisplay).map(r => {
            const role = interaction.guild?.roles.cache.get(r)
            return role ? `<@&${role.id}>` : r
        })
        const remainingCount = roles.length - maxDisplay

        let description = displayedRoles.join(', ')
        if (remainingCount > 0) description += `, y ${remainingCount} rol(es) más`

       
        const embed = new EmbedBuilder()
            .setTitle('📋 Roles autorizados')
            .setDescription(description)
            .setColor('Blue')
            .setFooter({
                text: 'RUNT CA COLOMBIA ERLC',
                iconURL: 'https://media.discordapp.net/attachments/1047946669079134249/1176943871595397172/Nuevo_Logo.png?ex=68c70165&is=68c5afe5&hm=292795090e996f2b079d274ac88d83240c9536ee929f6b0ee124cc074aaceadf&=&format=webp&quality=lossless&width=380&height=380',
            })
            .setTimestamp()

        return interaction.editReply({ embeds: [embed] })
    }
}
