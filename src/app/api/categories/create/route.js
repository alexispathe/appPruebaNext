// src/app/api/categories/create/route.js
import { NextResponse } from 'next/server';
import { firestore, verifyIdToken } from '../../../../libs/firebaseAdmin';
import admin from 'firebase-admin';

export async function POST(request) {
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken); // Verifica el token del usuario

    // Obtén el ID del usuario del token decodificado
    const ownerId = decodedToken.uid; // El ID del usuario actual

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ message: 'Nombre de la categoría obligatorio.' }, { status: 400 });
    }

    // Crear una referencia a un nuevo documento en la colección 'categories'
    const categoryDocRef = firestore.collection('categories').doc();

    const categoryData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      dateCreated: admin.firestore.FieldValue.serverTimestamp(),
      dateModified: admin.firestore.FieldValue.serverTimestamp(),
      uniqueID: categoryDocRef.id, // Establecer el uniqueID
      ownerId, // Usar el ownerId obtenido del token
    };

    await categoryDocRef.set(categoryData); // Guardar la categoría en Firestore

    return NextResponse.json({ message: 'Categoría creada exitosamente.', uniqueID: categoryDocRef.id }, { status: 201 });

  } catch (error) {
    console.error('Error al crear la categoría:', error);
    return NextResponse.json({ message: 'Error interno del servidor.', error: error.message }, { status: 500 });
  }
}
