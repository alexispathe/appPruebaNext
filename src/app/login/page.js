"use client"; // Necesario para usar hooks en componentes de cliente

import { loginWithGoogle } from '../../../lib/authService'; // Asegúrate de que la ruta sea correcta

const Login = () => {
  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      // Aquí puedes redirigir al usuario a otra página o realizar alguna acción
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
