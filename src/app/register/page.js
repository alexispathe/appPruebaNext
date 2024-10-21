"use client"; // Necesario para usar hooks en componentes de cliente

import { useRouter } from 'next/navigation'; // Importa useRouter
import { loginWithGoogle } from '../../libs/authService'; // Asegúrate de que la ruta sea correcta

const Register = () => {
  const router = useRouter(); // Inicializa el router

  const handleGoogleLogin = async () => {
    try {
      const { user, token } = await loginWithGoogle(); // Llama a la función de inicio de sesión con Google y obtiene el token
      // Crear el usuario en Firestore a través de la API
      await createUserInFirestore(user, token); // Pasa el token aquí
      
    } catch (error) {
      console.error("Error al crear la cuenta:", error.message);
    }
  };

  const createUserInFirestore = async (user, token) => {
    const response = await fetch('/api/users', { // Llama a la API
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Incluye el token en el encabezado
      },
      body: JSON.stringify({
        name: user.displayName || '',
        email: user.email,
        ownerId: user.uid,
      }),
    });
    if(response){
        // Redirige al usuario a la página de perfil después de iniciar sesión
      router.push('/profile'); // Cambia la ruta según sea necesario
    }
    if (!response.ok) {
      throw new Error('Error al crear el usuario en Firestore');
    }
  };

  return (
    <div>
      <h1>Crear una nueva cuenta</h1>
      <button onClick={handleGoogleLogin}>Iniciar sesión con Google</button>
    </div>
  );
};

export default Register;
