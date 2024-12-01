// src/app/api/categories/subCategories/update/[categoryID]/[subCategoryID]/route.js
import { NextResponse } from 'next/server';
import { firestore, verifyIdToken } from '../../../../../../../libs/firebaseAdmin';
import admin from 'firebase-admin';

export async function PUT(request, { params }) {
  const { categoryID, subCategoryID } = params;

  try {
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const { name, description, categoryID: newCategoryID } = await request.json();

    if (!name) {
      return NextResponse.json({ message: 'Nombre de la subcategoría obligatorio.' }, { status: 400 });
    }

    if (!newCategoryID) {
      return NextResponse.json({ message: 'ID de la categoría es obligatorio.' }, { status: 400 });
    }

    // Referencia al documento actual de la subcategoría
    const subcategoryDocRef = firestore
      .collection('categories')
      .doc(categoryID)
      .collection('subCategories')
      .doc(subCategoryID);

    const subcategoryDoc = await subcategoryDocRef.get();

    if (!subcategoryDoc.exists) {
      return NextResponse.json({ message: 'Subcategoría no encontrada.' }, { status: 404 });
    }

    const subcategoryData = subcategoryDoc.data();

    // Verificar si el usuario es el propietario
    if (subcategoryData.ownerId !== userId) {
      return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
    }

    // Si el categoryID ha cambiado, mover la subcategoría a la nueva categoría
    if (newCategoryID !== categoryID) {
      // Referencia a la nueva categoría
      const newCategoryDocRef = firestore.collection('categories').doc(newCategoryID);
      const newCategoryDoc = await newCategoryDocRef.get();

      if (!newCategoryDoc.exists) {
        return NextResponse.json({ message: 'Nueva categoría no encontrada.' }, { status: 404 });
      }

      // Crear nuevo documento de subcategoría en la nueva categoría
      const newSubcategoryDocRef = newCategoryDocRef.collection('subCategories').doc(subCategoryID);

      const updatedData = {
        name: name.trim(),
        description: description ? description.trim() : '',
        dateModified: admin.firestore.FieldValue.serverTimestamp(),
        categoryID: newCategoryID,
      };

      // Copiar los datos de la subcategoría al nuevo lugar
      await newSubcategoryDocRef.set({
        ...subcategoryData,
        ...updatedData,
      });

      // Eliminar el documento de subcategoría antiguo
      await subcategoryDocRef.delete();
    } else {
      // Actualizar la subcategoría en la misma categoría
      const updatedData = {
        name: name.trim(),
        description: description ? description.trim() : '',
        dateModified: admin.firestore.FieldValue.serverTimestamp(),
      };

      await subcategoryDocRef.update(updatedData);
    }

    return NextResponse.json({ message: 'Subcategoría actualizada exitosamente.' }, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la subcategoría:', error);
    return NextResponse.json({ message: 'Error interno del servidor.', error: error.message }, { status: 500 });
  }
}
