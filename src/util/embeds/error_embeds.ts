import { EmbedBuilder } from 'discord.js';

export default class ErrorEmbeds {
    /**
     * @param {string} error - Error
     */
    static error(error :string) {
        const reason = error? error: "Error no especificado"
        return new EmbedBuilder()
            .setColor(0xFF4747) 
            .setTitle('⛔ Ocurrió un error tratando de ejecutar el comando')
            .setDescription(reason)
            .setFooter({ text: 'RUNT CA COLOMBIA ERLC', iconURL: 'https://media.discordapp.net/attachments/1047946669079134249/1176943871595397172/Nuevo_Logo.png?ex=68c70165&is=68c5afe5&hm=292795090e996f2b079d274ac88d83240c9536ee929f6b0ee124cc074aaceadf&=&format=webp&quality=lossless&width=380&height=380' })
            .setTimestamp();
    }

    
}
