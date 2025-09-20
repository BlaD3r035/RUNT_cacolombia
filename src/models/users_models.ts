import {query} from '../config/database/mysql/database_config.js'

export default class UsersModels {
    static async getUserByDiscordId(discord_id: string): Promise<any>{
        if(!discord_id){
            throw new Error('Field discord_id whas not provided')
        }
        const r = await query('SELECT * FROM users WHERE discord_id = ? LIMIT 1', [discord_id])
        return r

    }
    static async getUserById(user_id: string): Promise<any>{
        if(!user_id){
            throw new Error('Field user_id whas not provided')
        }
        const r = await query('SELECT * FROM users WHERE user_id = ? LIMIT 1', [user_id])
        return r[0]

    }

}