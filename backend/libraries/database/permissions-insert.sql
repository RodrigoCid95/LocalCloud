INSERT INTO permissions (
    api,
    level,
    description
  )
VALUES (
    'profile',
    0,
    'Permite obtener la info del usuario.'
  ),
(
    'profile',
    1,
    'Permite obtener la lista de aplicaciones del usuario.'
  ),
  (
    'profile',
    2,
    'Permite actualizar los datos del usuario.'
  ),
  (
    'profile',
    3,
    'Permite actualizar loa contraseña del usuario.'
  ),
  (
    'apps',
    0,
    'Permite obtener la lista de aplicaciones instaladas.'
  ),
  (
    'apps',
    1,
    'Permite instalar nuevas aplicaciones.'
  ),
  (
    'apps',
    2,
    'Permite desinstalar nuevas aplicaciones.'
  ),
  (
    'apps',
    3,
    'Permite asignar una aplicación a un usuario.'
  ),
  (
    'users',
    0,
    'Permite obtener la lista de usuarios.'
  ),
  (
    'users',
    1,
    'Permite crear un nuevo usuario.'
  ),
  (
    'users',
    2,
    'Permite actualizar un usuario.'
  ),
  (
    'users',
    2,
    'Permite eliminar un usuario.'
  );