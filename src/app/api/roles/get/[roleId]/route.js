// src/app/api/roles/get/[roleId]/route.js
import { NextResponse } from 'next/server';
import { firestore, verifyIdToken } from '../../../../../libs/firebaseAdmin';

export async function GET(request, { params }) {
  const { roleId } = params; // Obtiene el ID del rol desde la URL

  try {
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    await verifyIdToken(idToken); // Verifica el token del usuario

    const roleDocRef = firestore.collection('roles').doc(roleId);
    const roleSnapshot = await roleDocRef.get();

    if (!roleSnapshot.exists) {
      return NextResponse.json({ message: 'Rol no encontrado.' }, { status: 404 });
    }

    const roleData = roleSnapshot.data();
    
    // Devuelve solo el roleId y permissions
    return NextResponse.json({
      roleId: roleSnapshot.id,
      permissions: roleData.permissions || []
    }, { status: 200 });

  } catch (error) {
    console.error('Error al obtener el rol:', error);
    return NextResponse.json({ message: 'Error interno del servidor.', error: error.message }, { status: 500 });
  }
}
