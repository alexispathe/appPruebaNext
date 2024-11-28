import os
from pathlib import Path

# Definimos la estructura de carpetas y archivos como un diccionario anidado
structure = {
    'app': {
        'api': {
            'roles': {
                'create': ['route.js'],
                'update': ['route.js'],
                'delete': ['route.js'],
                'get': ['route.js'],
                'list': ['route.js']
            },
            'users': {
                'create': ['route.js'],
                'update': ['route.js'],
                'delete': ['route.js'],
                'get': ['route.js'],
                'list': ['route.js'],
                'addresses': {
                    'create': ['route.js'],
                    'update': ['route.js'],
                    'delete': ['route.js'],
                    'get': ['route.js'],
                    'list': ['route.js']
                }
            },
            'categories': {
                'create': ['route.js'],
                'update': ['route.js'],
                'delete': ['route.js'],
                'get': ['route.js'],
                'list': ['route.js'],
                'subcategories': {
                    'create': ['route.js'],
                    'update': ['route.js'],
                    'delete': ['route.js'],
                    'get': ['route.js'],
                    'list': ['route.js']
                }
            },
            'products': {
                'create': ['route.js'],
                'update': ['route.js'],
                'delete': ['route.js'],
                'get': ['route.js'],
                'list': ['route.js'],
                'reviews': {
                    'create': ['route.js'],
                    'update': ['route.js'],
                    'delete': ['route.js'],
                    'get': ['route.js'],
                    'list': ['route.js']
                }
            },
            'carts': {
                'create': ['route.js'],
                'update': ['route.js'],
                'delete': ['route.js'],
                'get': ['route.js'],
                'list': ['route.js']
            },
            'orders': {
                'create': ['route.js'],
                'update': ['route.js'],
                'delete': ['route.js'],
                'get': ['route.js'],
                'list': ['route.js']
            },
            'transactions': {
                'create': ['route.js'],
                'update': ['route.js'],
                'delete': ['route.js'],
                'get': ['route.js'],
                'list': ['route.js']
            },
            'reviewsGlobal': {  # Opcional
                'create': ['route.js'],
                'update': ['route.js'],
                'delete': ['route.js'],
                'get': ['route.js'],
                'list': ['route.js']
            },
            'wishlists': {  # Opcional
                'create': ['route.js'],
                'update': ['route.js'],
                'delete': ['route.js'],
                'get': ['route.js'],
                'list': ['route.js']
            },
            'notifications': {  # Opcional
                'create': ['route.js'],
                'update': ['route.js'],
                'delete': ['route.js'],
                'get': ['route.js'],
                'list': ['route.js']
            },
            'adminData': {  # Opcional
                'create': ['route.js'],
                'update': ['route.js'],
                'delete': ['route.js'],
                'get': ['route.js'],
                'list': ['route.js']
            }
        },
        'roles': {
            'create': ['page.js'],
            'update': ['page.js'],
            'delete': ['page.js'],
            'list': ['page.js'],
            '[roleId]': ['page.js']
        },
        'users': {
            'create': ['page.js'],
            'update': ['page.js'],
            'delete': ['page.js'],
            'list': ['page.js'],
            '[userId]': ['page.js'],
            'addresses': {
                'create': ['page.js'],
                'update': ['page.js'],
                'delete': ['page.js'],
                'list': ['page.js']
            }
        },
        'categories': {
            'create': ['page.js'],
            'update': ['page.js'],
            'delete': ['page.js'],
            'list': ['page.js'],
            '[categoryId]': ['page.js'],
            'subcategories': {
                'create': ['page.js'],
                'update': ['page.js'],
                'delete': ['page.js'],
                'list': ['page.js']
            }
        },
        'products': {
            'create': ['page.js'],
            'update': ['page.js'],
            'delete': ['page.js'],
            'list': ['page.js'],
            '[productId]': ['page.js'],
            'reviews': {
                'create': ['page.js'],
                'update': ['page.js'],
                'delete': ['page.js'],
                'list': ['page.js']
            }
        },
        'carts': {
            'create': ['page.js'],
            'update': ['page.js'],
            'delete': ['page.js'],
            'list': ['page.js'],
            '[userId]': ['page.js']
        },
        'orders': {
            'create': ['page.js'],
            'update': ['page.js'],
            'delete': ['page.js'],
            'list': ['page.js'],
            '[orderId]': ['page.js']
        },
        'transactions': {
            'create': ['page.js'],
            'update': ['page.js'],
            'delete': ['page.js'],
            'list': ['page.js'],
            '[transactionId]': ['page.js']
        },
        'reviewsGlobal': {  # Opcional
            'create': ['page.js'],
            'update': ['page.js'],
            'delete': ['page.js'],
            'list': ['page.js'],
            '[reviewId]': ['page.js']
        },
        'wishlists': {  # Opcional
            'create': ['page.js'],
            'update': ['page.js'],
            'delete': ['page.js'],
            'list': ['page.js'],
            '[userId]': ['page.js']
        },
        'notifications': {  # Opcional
            'create': ['page.js'],
            'update': ['page.js'],
            'delete': ['page.js'],
            'list': ['page.js'],
            '[notificationId]': ['page.js']
        },
        'adminData': {  # Opcional
            'create': ['page.js'],
            'update': ['page.js'],
            'delete': ['page.js'],
            'list': ['page.js'],
            '[configId]': ['page.js']
        }
    }
}

def create_structure(base_path, structure_dict):
    """
    Recursively crea directorios y archivos basados en el diccionario de estructura.
    
    :param base_path: Path objeto de la ubicación base donde se creará la estructura.
    :param structure_dict: Diccionario que define la estructura de carpetas y archivos.
    """
    for name, content in structure_dict.items():
        current_path = base_path / name
        if isinstance(content, dict):
            # Es una carpeta
            current_path.mkdir(parents=True, exist_ok=True)
            create_structure(current_path, content)  # Recursión para subcarpetas
        elif isinstance(content, list):
            # Es una lista de archivos en la carpeta actual
            current_path.mkdir(parents=True, exist_ok=True)
            for file in content:
                file_path = current_path / file
                if not file_path.exists():
                    file_path.touch()  # Crea un archivo vacío
                    print(f"Creado archivo: {file_path}")
                else:
                    print(f"El archivo ya existe: {file_path}")

if __name__ == "__main__":
    # Directorio actual donde se ejecuta el script
    current_dir = Path.cwd()
    create_structure(current_dir, structure)

    print("Estructura de carpetas y archivos creada exitosamente.")
