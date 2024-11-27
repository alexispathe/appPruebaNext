import { NextResponse } from 'next/server';
import { firestore, verifyIdToken } from '../../../../../libs/firebaseAdmin';
import admin from 'firebase-admin';

export async function PUT(request, { params }) {
  const { productID } = params;

  try {
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const {
      name,
      description,
      price,
      stockQuantity,
      categoryID,
      subcategoryID,
      images,
    } = await request.json();

    // Validaciones
    if (!name || !description || !price || !stockQuantity || !categoryID || !subcategoryID) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios.' }, { status: 400 });
    }

    // Referencia al documento del producto
    const productDocRef = firestore.collection('products').doc(productID);
    const productDoc = await productDocRef.get();

    if (!productDoc.exists) {
      return NextResponse.json({ message: 'Producto no encontrado.' }, { status: 404 });
    }

    const productData = productDoc.data();

    // Verificar si el usuario es el propietario
    if (productData.ownerId !== userId) {
      return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
    }

    // Verificar si la categoría y subcategoría existen
    const categoryDocRef = firestore.collection('categories').doc(categoryID);
    const categoryDoc = await categoryDocRef.get();
    if (!categoryDoc.exists) {
      return NextResponse.json({ message: 'Categoría no encontrada.' }, { status: 404 });
    }

    const subCategoryDocRef = categoryDocRef.collection('subCategories').doc(subcategoryID);
    const subCategoryDoc = await subCategoryDocRef.get();
    if (!subCategoryDoc.exists) {
      return NextResponse.json({ message: 'Subcategoría no encontrada.' }, { status: 404 });
    }

    const updatedData = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity),
      categoryID,
      subcategoryID,
      images: images || [],
      dateModified: admin.firestore.FieldValue.serverTimestamp(),
    };

    await productDocRef.update(updatedData);

    return NextResponse.json({ message: 'Producto actualizado exitosamente.' }, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    return NextResponse.json({ message: 'Error interno del servidor.', error: error.message }, { status: 500 });
  }
}
