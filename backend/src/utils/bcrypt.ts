import bcrypt from "bcrypt"
export const hash = async(password:string , salt=10) => {
    return bcrypt.hash(password,salt)
}

export const compare = async(password:string,hashedPassword:string, salt=10)=>{
    return bcrypt.compare(password,hashedPassword)
}