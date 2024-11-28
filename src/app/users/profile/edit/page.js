// src/app/users/profile/EditProfile.js
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../../libs/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const EditProfile = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: '',
    profileImageUrl: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        loadUserData(user.uid);
      }
    });
    return () => unsubscribe(); // Limpieza del suscriptor
  }, [router]);

  const loadUserData = async (userId) => {
    const token = await auth.currentUser.getIdToken(); // Obtén el token del usuario
    const response = await fetch(`/api/users/${userId}/get`, {
      headers: {
        'Authorization': `Bearer ${token}`, // Incluye el token en la cabecera
      },
    });
    const data = await response.json();
    if (response.ok) {
      setUserData({ name: data.name, profileImageUrl: data.profileImageUrl || '' });
    } else {
      setError(data.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación básica para el nombre
    if (!userData.name.trim()) {
      setError('Por favor, ingresa un nombre válido.');
      return;
    }

    // Si se proporciona la URL, verificar su validez
    if (userData.profileImageUrl && !isValidUrl(userData.profileImageUrl)) {
      setError('Por favor, ingresa una URL de imagen válida.');
      return;
    }

    const token = await auth.currentUser.getIdToken(); // Obtén el token del usuario
    const response = await fetch(`/api/users/${auth.currentUser.uid}/put`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Incluye el token en la cabecera
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.message);
    } else {
      alert("Usuario actualizado correctamente");
    }
  };

  const isValidUrl = (url) => {
    const regex = /^(ftp|http|https):\/\/[^ "]+$/;
    return regex.test(url);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl mb-4">Modificar Información</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Nombre</label>
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">URL de la Imagen de Perfil (opcional)</label>
          <input
            type="text"
            name="profileImageUrl"
            value={userData.profileImageUrl}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Actualizar Información
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
