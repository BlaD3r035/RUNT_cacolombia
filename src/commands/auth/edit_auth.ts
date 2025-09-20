import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import RuntAuthModels from '../../models/Runt_auth_models.js'
import ErrorEmbeds from '../../util/embeds/error_embeds.js'

export default {
    authLevel: 3,
    allServers: false,
    devOnly: false,
    data: new SlashCommandBuilder()
        .setName('authorize-edit')
        .setDescription('Edita los datos de una empresa autorizada en RUNT BOT')
        .addStringOption(option => 
            option.setName('guild_id')
                .setDescription('Selecciona la empresa a editar')
                .setAutocomplete(true) 
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('nombre')
                .setDescription('Nuevo nombre de la empresa')
                .setRequired(false)
        )
        .addUserOption(option => 
            option.setName('dueño')
                .setDescription('Nuevo dueño de la empresa')
                .setRequired(false)
        )
        .addStringOption(option => 
            option.setName('tipo')
                .setDescription('Nuevo tipo de empresa')
                .addChoices(
                    { name: "Secretaria", value: "Secretaria" },
                    { name: "Escuela", value: "Escuela" }
                )
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('channel_id')
                .setDescription('Nuevo canal asociado')
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option.setName('auth')
                .setDescription('Cambiar estado de autorización (true/false)')
                .setRequired(false)
        ),
        
    execute: async (interaction: any) => {
        const guild_id = interaction.options.getString('guild_id')
        const name = interaction.options.getString('nombre')
        const owner = interaction.options.getUser('dueño')
        const user_id = owner ? owner.id : undefined
        const type = interaction.options.getString('tipo')
        const channel_id = interaction.options.getString('channel_id')
        const auth = interaction.options.getBoolean('auth')

        const gga = await RuntAuthModels.getGuildAuth(guild_id)
        if (!gga || gga.length === 0) {
            return interaction.editReply({ 
                embeds: [ErrorEmbeds.error('No existe una empresa con esta guild_id')] 
            })
        }

        try {
            await RuntAuthModels.update(guild_id, {
                name,
                owner_id: user_id,
                type,
                channel_id,
                auth
            })

            const embed = new EmbedBuilder()
                .setTitle('✏️ Empresa editada correctamente!')
                .setColor('Blue')
                .addFields(
                    { name: "Guild de la empresa: ", value: guild_id },
                    ...(name ? [{ name: "Nuevo nombre:", value: name }] : []),
                    ...(user_id ? [{ name: "Nuevo dueño:", value: `<@${user_id}>` }] : []),
                    ...(type ? [{ name: "Nuevo tipo:", value: type }] : []),
                    ...(channel_id ? [{ name: "Nuevo canal:", value: `<#${channel_id}>` }] : []),
                    ...(typeof auth === 'boolean' ? [{ name: "Autorización:", value: auth ? '✅ Activa' : '⛔ Desactivada' }] : [])
                )
                .setFooter({ 
                    text: 'RUNT CA COLOMBIA ERLC', 
                    iconURL: 'https://media.discordapp.net/attachments/1047946669079134249/1176943871595397172/Nuevo_Logo.png?ex=68c70165&is=68c5afe5&hm=292795090e996f2b079d274ac88d83240c9536ee929f6b0ee124cc074aaceadf&=&format=webp&quality=lossless&width=380&height=380' 
                })
                .setTimestamp()

            return interaction.editReply({ embeds: [embed] })
        } catch (err: any) {
            return interaction.editReply({ 
                embeds: [ErrorEmbeds.error(`Error al editar empresa: ${err.message}`)] 
            })
        }
    },


    autocomplete: async (interaction: any) => {
        const focusedValue = interaction.options.getFocused()
        const allGuilds = await RuntAuthModels.getAuths()
       

       
        const filtered = allGuilds.filter((g: any) =>
            g.name.toLowerCase().includes(focusedValue.toLowerCase()) ||
            g.guild_id.includes(focusedValue)
        )

        await interaction.respond(
            filtered.slice(0, 25).map((g: any) => ({
                name: `${g.name} (${g.guild_id})`,
                value: g.guild_id
            }))
        )
    }
}
