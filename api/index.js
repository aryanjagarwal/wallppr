import axios from "axios";

const API_KEY = process.env.EXPO_PUBLIC_PIXABAY_API_KEY;

const apiUrl = `https://pixabay.com/api/?key=${API_KEY}`;

const formatUrl = (params) => {
    let url = apiUrl + "&per_page=25&safesearch=false&editors_choice=true";
    if (!params) return url;
    let paramKeys = Object.keys(params);
    paramKeys.map(key=>{
        let value = key == 'q' ? encodeURIComponent(params[key]) : params[key];
        url += `&${key}=${value}`;
    })
    console.log("URL: ", url);
    return url;
}

export const apiCall = async (params) => {
    try {
        const response = await axios.get(formatUrl(params));
        const {data} = response;
        return {success: true, data};
    } catch (err) {
        console.log("Error: ", err.message);
        return {success: false, msg: err.message};
    }
}