// src/app/roles/create/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../libs/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export default function CreateRole() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    permissions: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Verificar autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validación básica
    if (!formData.name.trim()) {
      setError('El nombre del rol es obligatorio.');
      return;
    }

    // Procesar permisos (separados por comas)
    const permissionsArray = formData.permissions
      ? formData.permissions.split(',').map(p => p.trim())
      : [];

    const payload = {
      name: formData.name.trim(),
      permissions: permissionsArray,
      description: formData.description.trim(),
    };

    try {
      // Obtener el token de autenticación
      const user = auth.currentUser;
      if (!user) {
        setError('Usuario no autenticado.');
        return;
      }
      const token = await user.getIdToken();
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el rol.');
      }

      setSuccess('Rol creado exitosamente.');
      setFormData({ name: '', permissions: '', description: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl mb-4">Crear Nuevo Rol</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Nombre del Rol</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Permisos (separados por comas)</label>
          <input
            type="text"
            name="permissions"
            value={formData.permissions}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="e.g., leer, escribir, eliminar"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="Descripción del rol (opcional)"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Crear Rol
        </button>
      </form>
    </div>
  );
}
