import { Embed, EmbedBuilder } from 'discord.js';

export default class AuthEmbeds {
    /**
     * Embed para cuando el usuario no tiene permisos necesarios
     * @param {string[]} requiredPerms - Lista de permisos requeridos
     */
     static noPerms(requiredPerms: string[] = []) {
        const fields = [
            {
                name: 'Permisos requeridos',
                value: requiredPerms.length > 0 
                    ? requiredPerms.map((p) => `• ${p}`).join('\n') 
                    : 'No especificado',
                inline: false,
            },
        ];

        return new EmbedBuilder()
            .setColor(0xFF4747)
            .setTitle('⛔ Permisos insuficientes')
            .setDescription('No tienes los permisos necesarios para usar este comando.')
            .addFields(...fields) 
            .setFooter({
                text: 'RUNT CA COLOMBIA ERLC',
                iconURL: 'https://media.discordapp.net/attachments/1047946669079134249/1176943871595397172/Nuevo_Logo.png?ex=68c70165&is=68c5afe5&hm=292795090e996f2b079d274ac88d83240c9536ee929f6b0ee124cc074aaceadf&=&format=webp&quality=lossless&width=380&height=380',
            })
            .setTimestamp();
    }

    /**
     * Embed para cuando el comando es solo para desarrolladores
     */
    static devOnly() {
        return new EmbedBuilder()
            .setColor(0x7289DA) 
            .setTitle('🛠️ Comando de Desarrollador')
            .setDescription('Este comando es exclusivo para los desarrolladores del bot.')
            .setFooter({ text: 'RUNT CA COLOMBIA ERLC', iconURL: 'https://media.discordapp.net/attachments/1047946669079134249/1176943871595397172/Nuevo_Logo.png?ex=68c70165&is=68c5afe5&hm=292795090e996f2b079d274ac88d83240c9536ee929f6b0ee124cc074aaceadf&=&format=webp&quality=lossless&width=380&height=380' })
            .setTimestamp();
    }
    static noChannel(){
        return new EmbedBuilder()
        .setColor("Red")
        .setTitle('🛠️ Ajuste requerido')
        .setDescription("El canal de notificaciones no está configurado. Si eres administrador del servidor usa /configurar_canal_notificaciones para poder usar el Bot")
        .setFooter({ text: 'RUNT CA COLOMBIA ERLC', iconURL: 'https://media.discordapp.net/attachments/1047946669079134249/1176943871595397172/Nuevo_Logo.png?ex=68c70165&is=68c5afe5&hm=292795090e996f2b079d274ac88d83240c9536ee929f6b0ee124cc074aaceadf&=&format=webp&quality=lossless&width=380&height=380' })
        .setTimestamp();
    }

    /**
     * Embed para cuando el usuario tiene permisos suspendidos temporalmente
     * @param {string} reason - Razón de la suspensión
     * @param {string} until - Tiempo hasta que se levante la suspensión
     */
    static suspended(reason = 'No especificado', until = 'Indefinido') {
        return new EmbedBuilder()
            .setColor(0xFFA500) 
            .setTitle('⚠️ Permisos suspendidos')
            .setDescription('Actualmente no puedes ejecutar comandos debido a una suspensión.')
            .addFields(
                { name: 'Razón', value: reason, inline: true },
                { name: 'Válido hasta', value: until, inline: true }
            )
            .setFooter({ text: 'RUNT CA COLOMBIA ERLC', iconURL: 'https://media.discordapp.net/attachments/1047946669079134249/1176943871595397172/Nuevo_Logo.png?ex=68c70165&is=68c5afe5&hm=292795090e996f2b079d274ac88d83240c9536ee929f6b0ee124cc074aaceadf&=&format=webp&quality=lossless&width=380&height=380' })
            .setTimestamp();
    }
}
