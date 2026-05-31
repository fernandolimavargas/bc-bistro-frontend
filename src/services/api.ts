import axios from "axios"; 

export const api = axios.create({ 
    //baseURL: "http://192.168.68.240:5031/" BRASA CHURCH
    //baseURL: "https://192.168.15.10:7273" //CASA
    //baseURL: import.meta.env.VITE_API_URL
    
      baseURL: import.meta.env.VITE_API_URL,
    
})