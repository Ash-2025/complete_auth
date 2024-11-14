const getEnv = (key:string, def?:string):string => {
    const value = process.env.DATABASE_URL || def

    if(value === undefined){
        throw new Error(`missing environment variable ${value}`);
    }
    return value;
}
// we could have done process.env.db_url! to avoid string|undefined error
export const DATABASE_URL = process.env.DATABASE_URL!