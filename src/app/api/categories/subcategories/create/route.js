// src/app/api/categories/subCategories/create/route.js
//Las sub categorias se guardan dentro de la coleccion de cateroias como sub coleccion
import { NextResponse } from 'next/server';
import { firestore, verifyIdToken } from '../../../../../libs/firebaseAdmin';
import admin from 'firebase-admin';

export async function POST(request) {
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);

    const ownerId = decodedToken.uid;

    const { name, description, categoryID } = await request.json();

    if (!name) {
      return NextResponse.json({ message: 'Nombre de la subcategoría obligatorio.' }, { status: 400 });
    }

    if (!categoryID) {
      return NextResponse.json({ message: 'ID de la categoría es obligatorio.' }, { status: 400 });
    }

    // Generar URL única
    const randomTwoDigits = Math.floor(Math.random() * 90) + 10; // 10 to 99
    const url = `${name.trim().toLowerCase().replace(/\s+/g, '-')}-${randomTwoDigits}`;

    // Referencia al documento de la categoría
    const categoryDocRef = firestore.collection('categories').doc(categoryID);

    // Verificar si la categoría existe
    const categoryDoc = await categoryDocRef.get();
    if (!categoryDoc.exists) {
      return NextResponse.json({ message: 'Categoría no encontrada.' }, { status: 404 });
    }

    // Crear referencia al nuevo documento en la subcolección 'subcategories'
    const subcategoryDocRef = categoryDocRef.collection('subCategories').doc();

    const subcategoryData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      dateCreated: admin.firestore.FieldValue.serverTimestamp(),
      dateModified: admin.firestore.FieldValue.serverTimestamp(),
      subCategoryID: subcategoryDocRef.id,
      ownerId,
      categoryID,
      url,
    };
    console.log(subcategoryData)
    await subcategoryDocRef.set(subcategoryData);

    return NextResponse.json({ message: 'Subcategoría creada exitosamente.', subCategoryID: subcategoryDocRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error al crear la subcategoría:', error);
    return NextResponse.json({ message: 'Error interno del servidor.', error: error.message }, { status: 500 });
  }
}
