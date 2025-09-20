import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, ChannelType } from 'discord.js'
import RuntAuthModels from '../../models/Runt_auth_models.js'

export default {
    authLevel: 2,
    allServers: true,
    devOnly: false,
    data: new SlashCommandBuilder()
        .setName('configurar_canal_notificaciones')
        .setDescription('Añade o modifica el canal de notificaciones')
        .addChannelOption(option =>
            option
                .setName('canal')
                .setDescription('Canal donde se enviarán las notificaciones del bot')
                .setRequired(true)
        ),

    execute: async (interaction: ChatInputCommandInteraction) => {
        const channel = interaction.options.getChannel('canal')
        if (!channel) return interaction.editReply('No se encontró el canal.')

        if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
            return interaction.editReply('Debes seleccionar un canal de texto válido.')
        }

        const channel_id = channel.id
        const guild_id = interaction.guild?.id
        if (!guild_id) return interaction.editReply('Guild no válida.')

        await RuntAuthModels.changeChannelId(channel_id, guild_id) 

        const embed = new EmbedBuilder()
            .setTitle('✅ Canal de notificaciones configurado')
            .setDescription(`El canal <#${channel_id}> será usado para enviar las notificaciones del bot.`)
            .setColor('Green')
            .setFooter({
                text: 'RUNT CA COLOMBIA ERLC',
                iconURL: 'https://media.discordapp.net/attachments/1047946669079134249/1176943871595397172/Nuevo_Logo.png',
            })
            .setTimestamp()

        return interaction.editReply({ embeds: [embed] })
    }
}
