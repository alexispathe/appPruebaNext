// src/app/api/users/route.js
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
    await verifyIdToken(idToken); // Verifica el token del usuario

    const { name, email, ownerId } = await request.json();

    if (!name || !email || !ownerId) {
      return NextResponse.json({ message: 'Nombre, correo y ID de propietario son obligatorios.' }, { status: 400 });
    }

    // Verificar si el usuario ya existe
    const userDocRef = firestore.collection('users').doc(ownerId);
    const docSnapshot = await userDocRef.get();

    if (docSnapshot.exists) {
      return NextResponse.json({ message: 'Ya existe una cuenta con este ID de propietario.' }, { status: 400 });
    }

    const userData = {
      name: name.trim(),
      email,
      roleId: 'gB4kyZZNT8HLbsyTBRGi', // ID del rol del usuario
      dateCreated: admin.firestore.FieldValue.serverTimestamp(),
      dateModified: admin.firestore.FieldValue.serverTimestamp(),
      ownerId,
    };
    
    // Guardar el usuario en la referencia creada
    await userDocRef.set(userData);

    return NextResponse.json({ message: 'Usuario creado exitosamente.', ownerId }, { status: 201 });

  } catch (error) {
    console.error('Error al crear el usuario:', error);
    return NextResponse.json({ message: 'Error interno del servidor.', error: error.message }, { status: 500 });
  }
}

