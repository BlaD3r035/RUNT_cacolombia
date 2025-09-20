import {query} from '../config/database/mysql/database_config.js'
export default class {
  
   static async findRequestByUserId(
        user_id: string,
        filter: "none" | "pending" | "approved" | "rejected"
    ) {
        if (!user_id) {
            throw new Error('User Id was not provided')
        }

        let sql = 'SELECT * FROM license_requests WHERE user_id = ?'
        const params: any[] = [user_id]

        if (filter !== "none") {
            sql += ' AND status = ?'
            params.push(filter)
        }

        const r = await query(sql, params)
        return r
    }
     static async findRequests(
        filter: "none" | "En revision" | "Aprobado" | "Denegado"
    ) {
        let sql = 'SELECT * FROM license_requests'
        const params: any[] = []

        if (filter !== "none") {
            sql += ' WHERE status = ?'
            params.push(filter)
        }

        const r = await query(sql, params)
        return r
    }
    static async findRequestById(request_id : string){
       if(!request_id){
        throw new Error('Field request_id was not provided')
       }
       const r = await query('SELECT * FROM license_requests WHERE request_id = ? ',[request_id])
       return r
    }
    static async changeRequestStatus(request_id: string, status:"En revision" | "Aprobado"| "Denegado", agent_id: string){
        if(!request_id || !status|| !agent_id){
            throw new Error('request_id , status or agent_id field was not provided')
        }
        const r = await query('SELECT request_id FROM license_requests WHERE request_id = ?',[request_id])
        if(!r || r.length == 0){
            throw new Error(' requests does not exists')
        }
        await query('UPDATE license_requests SET status =? , agent_id = ? WHERE request_id = ?',[status,agent_id,  request_id])
        return "Status successfully changed"
    }
}