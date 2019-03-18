import { TOKEN_ID } from '../environment'

export const TOKEN_KEY = TOKEN_ID;
//Verify the token in Local Storage
export const isAuthenticated = () => localStorage.getItem(TOKEN_KEY) !== null;
//Get token in Local Storage
export const getToken = () => localStorage.getItem(TOKEN_KEY);
//Send token to Local Storage
export const login = token => {
  localStorage.setItem(TOKEN_KEY, token);
};
//Delet token to Local Storage
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};