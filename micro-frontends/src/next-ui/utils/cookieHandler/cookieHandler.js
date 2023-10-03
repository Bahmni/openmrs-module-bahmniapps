export const getCookies = () => {
    const cookies = document.cookie.split(';');
    const cookiesObj = {};
    cookies.forEach(cookie => {
        const cookieArr = cookie.split('=');
        cookiesObj[cookieArr[0].trim()] = decodeURIComponent(cookieArr[1]);
    });
    return cookiesObj;
}
