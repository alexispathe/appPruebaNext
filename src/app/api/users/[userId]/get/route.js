// src/app/api/users/[userId]/get/route.js
import { NextResponse } from 'next/server';
import { firestore, verifyIdToken } from '../../../../../libs/firebaseAdmin';

export async function GET(request, { params }) {
  const { userId } = params; // Obtiene el ID de usuario desde la URL

  try {
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    await verifyIdToken(idToken); // Verifica el token del usuario

    const userDocRef = firestore.collection('users').doc(userId);
    const userSnapshot = await userDocRef.get();

    if (!userSnapshot.exists) {
      return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
    }

    const userData = userSnapshot.data();
    
    // Solo devuelve el ownerId, name y profileImageUrl
    const responseData = {
      ownerId: userData.ownerId,
      name: userData.name,
      profileImageUrl: userData.profileImageUrl || '',
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('Error al obtener la información del usuario:', error);
    return NextResponse.json({ message: 'Error interno del servidor.', error: error.message }, { status: 500 });
  }
}
