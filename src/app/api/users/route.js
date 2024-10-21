// src/app/api/users/route.js
import { NextResponse } from 'next/server';
import { firestore, verifyIdToken } from '../../../libs/firebaseAdmin';
import admin from 'firebase-admin'; // Importa el SDK de Firebase Admin

export async function POST(request) {
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    await verifyIdToken(idToken); // Verifica el token del usuario

    const { name, email, ownerId } = await request.json();
    console.log("Datos recibidos:", { name, email, ownerId });

    if (!name || !email || !ownerId) {
      return NextResponse.json({ message: 'Nombre, correo y ID de propietario son obligatorios.' }, { status: 400 });
    }

    // Crear una referencia a un nuevo documento en la colección 'users'
    const userDocRef = firestore.collection('users').doc(ownerId); // Usar ownerId como ID del documento

    const userData = {
      name: name.trim(),
      email,
      roleId: 'gB4kyZZNT8HLbsyTBRGi', // ID del rol del usuario
      dateCreated: admin.firestore.FieldValue.serverTimestamp(),
      dateModified: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Guardar el usuario en la referencia creada
    await userDocRef.set(userData);

    return NextResponse.json({ message: 'Usuario creado exitosamente.', ownerId }, { status: 201 });

  } catch (error) {
    console.error('Error al crear el usuario:', error);
    return NextResponse.json({ message: 'Error interno del servidor.', error: error.message }, { status: 500 });
  }
}
