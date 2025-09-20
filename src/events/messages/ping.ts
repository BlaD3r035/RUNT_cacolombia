import {Events} from 'discord.js'
import { once } from 'events'

export default {
    name:Events.MessageCreate,
    once:false,
    async execute(message: any){
        if(message.content == '.ping'){
            return message.reply('pong!')
        }

    }
}