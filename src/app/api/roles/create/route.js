// src/app/api/roles/create/route.js
import { NextResponse } from 'next/server';
import { firestore, verifyIdToken } from '../../../../libs/firebaseAdmin';
import admin from 'firebase-admin'; // Importa el SDK de Firebase Admin

export async function POST(request) {
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);

    const { name, permissions, description } = await request.json();
    console.log("Datos recibidos:", { name, permissions, description });

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ message: 'El nombre del rol es obligatorio.' }, { status: 400 });
    }

    // Manejar permissions de forma flexible
    const permissionsArray = Array.isArray(permissions)
      ? permissions.map(p => p.trim())
      : typeof permissions === 'string'
      ? permissions.split(',').map(p => p.trim())
      : [];

    // Crear una referencia a un nuevo documento en la colección 'roles'
    const roleDocRef = firestore.collection('roles').doc();

    const newRole = {
      name: name.trim(),
      permissions: permissionsArray,
      description: description ? description.trim() : '',
      dateCreated: admin.firestore.FieldValue.serverTimestamp(),
      dateModified: admin.firestore.FieldValue.serverTimestamp(),
      rolID: roleDocRef.id, // Establecer el rolID con el ID del documento
    };

    // Guardar el rol en la referencia creada
    await roleDocRef.set(newRole);

    return NextResponse.json({ message: 'Rol creado exitosamente.', rolID: roleDocRef.id }, { status: 201 });

  } catch (error) {
    console.error('Error al crear el rol:', error);
    return NextResponse.json({ message: 'Error interno del servidor.', error: error.message }, { status: 500 });
  }
}
