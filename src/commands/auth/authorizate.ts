import {SlashCommandBuilder, EmbedBuilder} from 'discord.js'
import RuntAuthModels from '../../models/Runt_auth_models.js'
import ErrorEmbeds from '../../util/embeds/error_embeds.js'
export default {
    authLevel: 3,
    allServers: false,
    devOnly:false,
    data:new SlashCommandBuilder()
    .setName('authorizate')
    .setDescription('Authorize an user to use RUNT BOT commands')
    .addStringOption((option) => option.setName('nombre').setDescription('Nombre de la empresa').setRequired(true))
    .addStringOption(option => option.setName('guild_id').setDescription('Id del server de la empresa').setRequired(true))
    .addUserOption(option => option.setName('dueño').setDescription('Dueño de la empresa').setRequired(true))
    .addStringOption(option => option.setName('tipo').setDescription('Tipo de empresa').addChoices(
        {name:"Secretaria",value:"Secretaria"},
        {name:"Escuela",value:"Escuela"}
    ).setRequired(true))
    ,
    execute: async (interaction: any) =>{
        const name = interaction.options.getString('nombre')
        const guild_id = interaction.options.getString('guild_id')
        const owner = interaction.options.getUser('dueño')
        const user_id = owner.id
        const type = interaction.options.getString('tipo')
        const gga =  await RuntAuthModels.getGuildAuth(guild_id)
       if(gga && gga.length > 0){
        return interaction.editReply({embeds:[ErrorEmbeds.error('Ya existe una empresa con esta guild_Id')]})
       }
       await RuntAuthModels.create(name,guild_id,user_id,type,true)
       const embed = new EmbedBuilder()
       .setTitle('✅ Empresa autorizada correctamente!')
       .setColor('Green')
       .addFields(
        {name:"Nombre de la empresa: ", value: name},
        {name:"Guild de la empresa: ", value: guild_id},
        {name:"Dueño de la empresa: ", value: `<@${user_id}>`},
        {name:"Tipo de la empresa: ", value: type},

       )
        .setFooter({ text: 'RUNT CA COLOMBIA ERLC', iconURL: 'https://media.discordapp.net/attachments/1047946669079134249/1176943871595397172/Nuevo_Logo.png?ex=68c70165&is=68c5afe5&hm=292795090e996f2b079d274ac88d83240c9536ee929f6b0ee124cc074aaceadf&=&format=webp&quality=lossless&width=380&height=380' })
        .setTimestamp();
       
       return interaction.editReply({embeds:[embed]})

        

      
    }
}