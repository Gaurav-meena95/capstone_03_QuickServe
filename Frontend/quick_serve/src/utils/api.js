// API utility for handling token refresh
export const fetchWithAuth = async (url, options = {}) => {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    
    const headers = {
        ...options.headers,
        'Authorization': `JWT ${accessToken}`,
        'x-refresh-token': refreshToken
    }
    
    const response = await fetch(url, {
        ...options,
        headers
    })
    
    // Check if new tokens were sent in response headers
    const newAccessToken = response.headers.get('x-access-token')
    const newRefreshToken = response.headers.get('x-refresh-token')
    
    if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken)
    }
    if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken)
    }
    
    return response
}