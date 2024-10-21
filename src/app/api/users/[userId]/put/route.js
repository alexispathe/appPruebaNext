// src/app/api/users/[userId]/put/route.js
import { NextResponse } from 'next/server';
import { firestore, verifyIdToken } from '../../../../../libs/firebaseAdmin';
import admin from 'firebase-admin';

export async function PUT(request, { params }) {
  const { userId } = params; // Obtiene el ID de usuario desde la URL
  console.log(userId)
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    const idToken = authorization.split('Bearer ')[1];
    await verifyIdToken(idToken); // Verifica el token del usuario

    const { name, profileImageUrl } = await request.json();

    if (!name ) {
      return NextResponse.json({ message: 'Nombrerd obligatorio y válidos.' }, { status: 400 });
    }

    const userDocRef = firestore.collection('users').doc(userId);
    const userSnapshot = await userDocRef.get();
    if (!userSnapshot.exists) {
      return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
    }

    const userData = {
      name: name.trim(),
      profileImageUrl,
      dateModified: admin.firestore.FieldValue.serverTimestamp(),
    };

    await userDocRef.update(userData); // Actualiza el documento del usuario

    return NextResponse.json({ message: 'Información de usuario actualizada exitosamente.' }, { status: 200 });

  } catch (error) {
    console.error('Error al actualizar la información del usuario:', error);
    return NextResponse.json({ message: 'Error interno del servidor.', error: error.message }, { status: 500 });
  }
}
