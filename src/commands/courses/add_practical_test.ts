import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction ,GuildMemberRoleManager} from 'discord.js'
import UsersModels from '../../models/users_models.js'
import RuntAuthModels from '../../models/Runt_auth_models.js'
import CoursesModels from '../../models/Courses_models.js'
import ErrorEmbeds from '../../util/embeds/error_embeds.js'
import fetch from 'node-fetch'
export default {
    authLevel: 1,
    allServers: true,
    devOnly: false,
    data: new SlashCommandBuilder()
        .setName('nuevo_curso_practico')
        .setDescription('Añade un nuevo curso práctico de conducción a una persona')
        .addUserOption(option => option
            .setName('user')
            .setDescription('Usuario a asignar el curso práctico ')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('categoria')
            .setDescription('Categoría de la licencia')
            .addChoices(
                { name: "A1", value: "A1" },
                { name: "A2", value: "A2" },
                { name: "B1", value: "B1" },
                { name: "B2", value: "B2" },
                { name: "B3", value: "B3" },
                { name: "C1", value: "C1" },
                { name: "C2", value: "C2" },
                { name: "C3", value: "C3" },
            )
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('puntaje')
            .setDescription('Puntaje del curso')
            .addChoices(
                { name: "Aprobado", value: "Aprobado" },
                { name: "Reprobado", value: "Reprobado" }
            )
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('comentarios')
            .setDescription('Comentarios adicionales por el examinador')
            .setRequired(false)
        ),

    execute: async (interaction: ChatInputCommandInteraction) => {
         const auth = await RuntAuthModels.getAuthType(interaction.guild!.id);
            if (auth != "Escuela") {
              return interaction.editReply({
                embeds: [ErrorEmbeds.error("Solo Escuela puede usar este comando")],
              });
            }
        
        const member = interaction.member
        if (!member || !('roles' in member))
            return interaction.editReply('No se pudo obtener tus roles.')

        const userRoles = (member.roles as GuildMemberRoleManager).cache.map(r => r.id) 
        const guildId = interaction.guild?.id
        if (!guildId) return interaction.editReply('Guild no válida.')

        
        const hasRole = await RuntAuthModels.checkRoles(userRoles, guildId)
        if (!hasRole) return interaction.editReply({embeds:[ErrorEmbeds.error("❌ No tienes los roles necesarios para usar este comando.")]})

        
        const user = interaction.options.getUser('user')
        const user_discord_id = user!.id
        const categoria = interaction.options.getString('categoria')
        const puntaje = interaction.options.getString('puntaje')
        const comentarios = interaction.options.getString('comentarios') || 'Sin comentarios'
        const r = await UsersModels.getUserByDiscordId(user_discord_id)
        if(!r || r.length == 0){
            return interaction.editReply({embeds:[ErrorEmbeds.error('El usuario no tiene una cedula creada')]})
        }
        const r_ex = await UsersModels.getUserByDiscordId(interaction.user.id)
        if(!r_ex || r_ex.length == 0){
            return interaction.editReply({embeds:[ErrorEmbeds.error('El examinador no tiene una cedula creada')]})
        }
        const userDoc = r[0]
        const examinerDoc = r_ex[0]
       
        
        const rc = await CoursesModels.create(userDoc!.user_id,"Practico",categoria!,puntaje!,"NINGUNA",comentarios,examinerDoc!.user_id)

        try {
            await fetch('https://app.cacolombia.com/v1/generate-certificate', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseData: {
                        type:"Practico",
                        restriction: "NINGUNA",
                        test_id: rc.id,
                        license_cat: categoria,
                        score: puntaje,
                        commetns: comentarios,
                        created_at: new Date(),
                    },
                    userData: userDoc,
                    examinerName: `${examinerDoc.first_names} ${examinerDoc.last_names} CC:${examinerDoc.user_id}`
                })
            })
        } catch (err) {
            console.error('⚠️ Error al generar el certificado:', err)
        }


        const embed = new EmbedBuilder()
            .setTitle('✅ Curso práctico agregado')
            .setDescription(`Se ha asignado un nuevo curso práctico al usuario <@${user_discord_id}>.`)
            .addFields(
                { name: 'Categoría', value: categoria!, inline: true },
                { name: 'Puntaje', value: puntaje!, inline: true },
                { name: 'Comentarios', value: comentarios!, inline: false },
                { name: 'Fecha', value: new Date().toLocaleDateString(), inline: true },
                {name:'Certificado', value: `https://app.cacolombia.com/pdfs/cursos/${rc.id}.pdf`}
            )
            .setColor('Green')
            .setFooter({ text: 'RUNT CA COLOMBIA ERLC', 
                                iconURL: 'https://media.discordapp.net/attachments/1047946669079134249/1176943871595397172/Nuevo_Logo.png?ex=68c70165&is=68c5afe5&hm=292795090e996f2b079d274ac88d83240c9536ee929f6b0ee124cc074aaceadf&=&format=webp&quality=lossless&width=380&height=380',

             })
            .setTimestamp()
        
        const chnl_auth = await RuntAuthModels.getGuildAuth(interaction.guild.id)
                    
        const channel_nots : any = interaction.guild.channels.cache.get(chnl_auth[0]!.channel_id)
        if(channel_nots){
            try{
                channel_nots.send({content:`<@${interaction.user.id}>` ,embeds:[embed]})

            }catch(err){

            }
        }
        
        return interaction.editReply({ embeds: [embed] })
    }
}
