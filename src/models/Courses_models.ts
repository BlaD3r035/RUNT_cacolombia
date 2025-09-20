 import {query} from  '../config/database/mysql/database_config.js'
 export default class CoursesModels {
    static async create(user_id :string, type: string,license_cat: string,score:string,restriction:string,comments : string,examiner_id: string){
        if(!user_id|| !type|| !license_cat || !score || !restriction || !comments || !examiner_id){
            throw new Error('Missing fields (user_id, type, license_cat, score, restriction, comments, examiner_id)')
        }
        const usr = await query('SELECT user_id FROM users WHERE user_id = ? LIMIT 1',[user_id])
        if(usr.length == 0){
            throw new Error("User with user_id does not exist")
        }
        const agn = await query('SELECT user_id FROM users WHERE user_id = ? LIMIT 1',[examiner_id])
        if(agn.length == 0){
            throw new Error("User with examiner_id does not exist")
        }

        if(type != "Teorico" && type != "Practico"){
            throw new Error('Type is not (Teorico, Practico)')
        }
        if(score != "Aprobado" && score != "Reprobado"){
            throw new Error('score is not (Aprobado, Reprobado)')
        }
        const license_restriction = ["NINGUNA","CONUCIR CON LENTES","CONDUCIR CON AUDÍFONOS", "CONDUCIR CON LENTES Y CON AUDÍFONOS"]
        if(!license_restriction.includes(restriction)){
           throw new Error('restriction is not ("NINGUNA", "CONUCIR CON LENTES", "CONDUCIR CON AUDÍFONOS", "CONDUCIR CON LENTES Y CON AUDÍFONOS")')
        }
        const cat_list = ["A1","A2","B1","B2","B3","C1","C2","C3"]
        if(!cat_list.includes(license_cat)){
            throw new Error('license_cat is not valid ("A1","A2","B1","B2","B3","C1","C2","C3")')
        }
        const r = await query('INSERT INTO drive_test (user_id, type, license_cat, score, restriction,comments, examiner_id) VALUES (?,?,?,?,?,?,?)',[user_id,type,license_cat,score,restriction,comments,examiner_id])
        return {message:"Drive_test successfully added", id: (r as any).insertId}




    }
    static async getById(test_id: string) {
        if(!test_id){
            throw new Error('test_id field was not provided')
        }
        const r = await query('SELECT * FROM drive_test WHERE test_id = ? LIMIT 1',[test_id])
            return r

    }

 }