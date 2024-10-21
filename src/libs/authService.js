// src/libs/authService.js

import { auth } from './firebaseConfig'; // Solo importa auth de firebaseConfig
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'; // Importa GoogleAuthProvider desde firebase/auth

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider(); // Crea una instancia de GoogleAuthProvider
  try {
    const result = await signInWithPopup(auth, provider); // Inicia sesión con Google
    const user = result.user; // Obtiene el usuario autenticado
    const token = await user.getIdToken(); // Obtiene el token
    console.log("Usuario autenticado:", user);
    return { user, token }; // Devuelve el usuario y el token
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error.message);
    throw error; // Lanza el error para manejarlo en otro lugar
  }
};

export const logout = async () => {
  try {
    await signOut(auth); // Cierra sesión
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message);
  }
};
