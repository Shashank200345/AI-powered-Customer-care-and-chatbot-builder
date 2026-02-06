'use server';

import { cookies } from "next/headers";

export const isAuthorized = async () => {
    const cookiesStore = await cookies();
    const userSession = cookiesStore.get("user_session") ;
    let user = null;

    if(userSession){
        try{
            user = JSON.parse(userSession.value);
        }catch(e){
            console.error("Failed to parse user session", e)
        }
    }
    return user;
}