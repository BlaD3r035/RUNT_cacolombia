import {query} from '../config/database/mysql/database_config.js' 
export default class LicensesModels {
    static async create(user_id:string,type: "A1"|"A2"| "B1"|"B2"|"B3"|"C1"|"C2"|"C3", restriction: string){
        if(!user_id || !type || !restriction){
            throw new Error('Missing Fields (user_id,type,restriction)')
        }
        const r: any = await query('SELECT user_id FROM licenses WHERE user_id = ? LIMIT 1',[user_id])

        if(r && r.length > 0){
            throw new Error('User already have a License')
        }
        
         const exp = new Date()
        await query('INSERT INTO licenses (user_id, type,restriction,exp) VALUES (?,?,?,?)',[user_id,type,restriction,exp])
        return {message:"Successfully license created",user_id,type,restriction,exp}

    }
    static async getById(user_id : string){
        if(!user_id){
            throw new Error('Field user_id not provided')
        }
        const r = await query('SELECT * FROM licenses WHERE user_id = ? ', [user_id])
        return r

    }
    
}