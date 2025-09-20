import {query} from '../config/database/mysql/database_config.js'
type AuthRoles = {
    roles: string[]
}
export default class RuntAuthModels {
    static async create(name : string, guild_id : string, owner_id : string , type :string, auth: boolean){
        if(!name || !guild_id || !owner_id || !type || !auth ){
        throw new Error('Missing fields (name, guild_id, owner_id, type, channel_id, auth)')
      }
       const existAuth = await query('SELECT guild_id FROM runt_auth WHERE guild_id = ? LIMIT 1', [guild_id])
       if(existAuth && existAuth.length > 0){
         throw new Error('Server Auth already exists')
       }
       await query('INSERT INTO runt_auth (name,guild_id,owner_id,type,auth) VALUES (?,?,?,?,?)',[name,guild_id,owner_id,type, auth])
       return "successful auth insert"
    }


    static async update(guild_id: string, updates: { 
  name?: string, 
  owner_id?: string, 
  type?: string, 
  channel_id?: string, 
  auth?: boolean 
}) {
  if (!guild_id) {
    throw new Error('Missing field: guild_id');
  }

  
  const existAuth = await query('SELECT guild_id FROM runt_auth WHERE guild_id = ? LIMIT 1', [guild_id]);
  if (!existAuth || existAuth.length === 0) {
    throw new Error('Server Auth not found');
  }


  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.owner_id) {
    fields.push('owner_id = ?');
    values.push(updates.owner_id);
  }
  if (updates.type) {
    fields.push('type = ?');
    values.push(updates.type);
  }
  if (updates.channel_id) {
    fields.push('channel_id = ?');
    values.push(updates.channel_id);
  }
  if (typeof updates.auth === 'boolean') {
    fields.push('auth = ?');
    values.push(updates.auth);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(guild_id); 
  const sql = `UPDATE runt_auth SET ${fields.join(', ')} WHERE guild_id = ?`;

  await query(sql, values);
  return "successful auth update";
}

   static async checkRoles(userRoles: string[], guild_id: string) {
    if (!userRoles || !guild_id) {
        throw new Error('Missing Fields (userRoles, guild_id)');
    }

    const r = await query(
        'SELECT auth_roles FROM runt_auth WHERE guild_id = ? LIMIT 1',
        [guild_id]
    );

    if (!r || r.length === 0) {
        throw new Error('Server Auth does not exist');
    }

    const auth_roles_raw = r[0]!.auth_roles;
    if (!auth_roles_raw) {
        throw new Error('The server has no authorized roles configured.');
    }

    let auth_roles;
    try {
        auth_roles = JSON.parse(auth_roles_raw); 
    } catch (e) {
        throw new Error('Invalid auth_roles format in database (must be valid JSON)');
    }

   
    const roles = Array.isArray(auth_roles?.roles) ? auth_roles.roles : [];
    if (roles.length === 0) {
        throw new Error('The server has no authorized roles configured.');
    }

    const hasRole = userRoles.some(role => roles.includes(role));

    return hasRole;
}





static async addRoles(guild_id: string, newRoles: string[]) {
    if (!guild_id || !newRoles || newRoles.length === 0) {
        throw new Error('Missing fields (guild_id, newRoles)')
    }

    const r = await query(
        'SELECT auth_roles FROM runt_auth WHERE guild_id = ? LIMIT 1', 
        [guild_id]
    )

    if (!r || r.length === 0) {
        throw new Error('Server Auth does not exist')
    }

    let auth_roles: AuthRoles = { roles: [] }
    const auth_roles_raw = r[0]!.auth_roles
    if (auth_roles_raw) {
        try {
            const parsed: unknown = JSON.parse(auth_roles_raw)
            if (
                typeof parsed === "object" &&
                parsed !== null &&
                Array.isArray((parsed as any).roles)
            ) {
                auth_roles = parsed as AuthRoles
            }
        } catch {
            auth_roles = { roles: [] }
        }
    }

    const rolesSet: Set<string> = new Set(auth_roles.roles)
    newRoles.forEach((role: string) => rolesSet.add(role))

    await query(
        'UPDATE runt_auth SET auth_roles = ? WHERE guild_id = ?',
        [JSON.stringify({ roles: Array.from(rolesSet) }), guild_id]
    )

    return Array.from(rolesSet)
}

static async getRoles(guild_id: string): Promise<string[]> {
    if (!guild_id) throw new Error('Missing field guild_id')

    const r = await query(
        'SELECT auth_roles FROM runt_auth WHERE guild_id = ? LIMIT 1',
        [guild_id]
    )

    if (!r || r.length === 0) throw new Error('Server Auth does not exist')

    const auth_roles_raw = r[0]!.auth_roles
    if (!auth_roles_raw) return []

    try {
        const auth_roles = JSON.parse(auth_roles_raw)
        return Array.isArray(auth_roles.roles) ? auth_roles.roles : []
    } catch {
        return []
    }
}

static async removeRoles(guild_id: string, rolesToRemove: string[]) {
    if (!guild_id || !rolesToRemove || rolesToRemove.length === 0) {
        throw new Error('Missing fields (guild_id, rolesToRemove)')
    }

    const r = await query(
        'SELECT auth_roles FROM runt_auth WHERE guild_id = ? LIMIT 1',
        [guild_id]
    )

    if (!r || r.length === 0) throw new Error('Server Auth does not exist')

    const auth_roles_raw = r[0]!.auth_roles
    if (!auth_roles_raw) return []

    let auth_roles = { roles: [] }
    try {
        auth_roles = JSON.parse(auth_roles_raw)
        if (!Array.isArray(auth_roles.roles)) auth_roles.roles = []
    } catch {
        auth_roles.roles = []
    }

   
    const newRoles = auth_roles.roles.filter(role => !rolesToRemove.includes(role))

    await query(
        'UPDATE runt_auth SET auth_roles = ? WHERE guild_id = ?',
        [JSON.stringify({ roles: newRoles }), guild_id]
    )

    return newRoles
}
 static async changeChannelId(channel_id : string, guild_id : string){
     if(!channel_id || !guild_id){
        throw new Error('Not channel_id or guild_id provided')
     }
     const auth =await this.getGuildAuth(guild_id)
     if(!auth || auth.length == 0){
        throw new Error('Server Auth does not exist')
     }
     await query('UPDATE runt_auth SET channel_id = ? WHERE guild_id = ?',[channel_id, guild_id])
     return "Successfully changed"
 }


    static async getGuildAuth(guild_id : string){
        if(!guild_id){
            throw new Error("guild_id was not provided")
        }
        const r = await query('SELECT * FROM runt_auth WHERE guild_id = ? LIMIT 1',[guild_id])
        return r
        
    }
    static async getAuths(){
        const r = await query('SELECT * FROM runt_auth',[])
        return r
    }
    static async getAuthType(guild_id : string){
        
        const r = await query('SELECT type FROM runt_auth WHERE guild_id = ? LIMIT 1',[guild_id])
        if(!r || r.length == 0 ){
           throw new Error('Guild Auth does not exists')
        }
        return r[0]!.type
        
    }
    
}