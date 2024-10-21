// src/app/profile/page.js
"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { auth } from '../../libs/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { signOut } from 'firebase/auth';

export default function Profile() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      }
    });
    return () => unsubscribe(); // Limpieza del suscriptor
  }, [router]);

  const navigateToCreateRole = () => {
    router.push('/roles/create');
  };
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login')
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
}
  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h1 className="text-3xl mb-4">Perfil del Usuario</h1>
      {/* Aquí puedes mostrar información del usuario */}
      <button
        onClick={navigateToCreateRole}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Crear Nuevo Rol
      </button>
      <button
        onClick={handleSignOut}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Cerrar sesion
      </button>
    </div>
  );
}
