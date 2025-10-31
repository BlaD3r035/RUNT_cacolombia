import {Events, ActivityType} from 'discord.js'

export default  {
    name: Events.ClientReady,
    once: true,
    async execute(client : any){
        
        client.user.setActivity('RUNT CA COLOMBIA ERLC.',{type: ActivityType.Watching})
      
       
    }
}

