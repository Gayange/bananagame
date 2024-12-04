// jwtUtils.js
import jwt_decode from 'jwt-decode';

export const isTokenExpired = (token) => {
  try {
    const decoded = jwt_decode(token);
    if (decoded.exp * 1000 < Date.now()) {
      return true;  // Token is expired
    }
    return false;  // Token is valid
  } catch (error) {
    return true;  // Token is invalid or cannot be decoded
  }
};



