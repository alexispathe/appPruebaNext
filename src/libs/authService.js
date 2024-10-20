import { auth } from './firebaseConfig'; // Asegúrate de que la ruta sea correcta
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Usuario autenticado:", user);
    return user; // Devuelve el usuario autenticado
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error.message);
    throw error; // Lanza el error para manejarlo donde se llame la función
  }
};
