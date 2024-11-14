import { LoginFormValues, RegisterFormValues } from "@/components/AuthComponent";
import API from "@/config/ApiClient";

export const login = async(data:LoginFormValues) => {
    // API.post("/auth/login", data)
    console.log(data)
}
export const RegisterAccount = async(data:RegisterFormValues) => {
    console.log(data)
}