
// src/app/api/categories/update/[url]route.js
import { NextResponse } from 'next/server';
import { firestore, verifyIdToken } from '../../../../../libs/firebaseAdmin';
import admin from 'firebase-admin';

export async function PUT(request, { params }) {
  const { url } = params; // Obtiene la propiedad url desde los parámetros
  console.log(params)

  try {
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    await verifyIdToken(idToken); // Verifica el token del usuario

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ message: 'Nombre de la categoría obligatorio.' }, { status: 400 });
    }

    // Buscar la categoría por la propiedad url
    const categorySnapshot = await firestore.collection('categories')
      .where('uniqueID', '==', url) // Cambia a buscar por la propiedad url
      .limit(1) // Limitar a un solo resultado
      .get();

    if (categorySnapshot.empty) {
      return NextResponse.json({ message: 'Categoría no encontrada.' }, { status: 404 });
    }

    const categoryDocRef = categorySnapshot.docs[0].ref; // Obtén la referencia del primer documento encontrado

    const categoryData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      dateModified: admin.firestore.FieldValue.serverTimestamp(),
    };

    await categoryDocRef.update(categoryData); // Actualiza el documento de la categoría

    return NextResponse.json({ message: 'Categoría actualizada exitosamente.' }, { status: 200 });

  } catch (error) {
    console.error('Error al actualizar la categoría:', error);
    return NextResponse.json({ message: 'Error interno del servidor.', error: error.message }, { status: 500 });
  }
}
