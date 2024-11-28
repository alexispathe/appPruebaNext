"use client"; // Necesario para usar hooks en componentes de cliente

import { useRouter } from 'next/navigation'; // Importa useRouter
import { loginWithGoogle } from '../../libs/authService'; // Asegúrate de que la ruta sea correcta

const Login = () => {
  const router = useRouter(); // Inicializa el router

  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      // Redirige al usuario a la página de perfil después de iniciar sesión
      router.push('/users/profile'); // Cambia la ruta según sea necesario
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
    }
  };

  return (
    <div>
      <h1>Iniciar sesión</h1>
      <button onClick={handleGoogleLogin}>Iniciar sesión con Google</button>
    </div>
  );
};

export default Login;
