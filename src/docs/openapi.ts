const secured = [{ bearerAuth: [] }];
const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } };
const desc: Record<number, string> = {
  200: 'OK', 201: 'Dibuat', 400: 'Validasi gagal', 401: 'Belum login / token salah',
  403: 'Tidak punya akses', 404: 'Tidak ditemukan', 409: 'Konflik',
};
const R = (...codes: number[]) =>
  Object.fromEntries(codes.map((c) => [c, { description: desc[c] }]));
const json = (properties: object, required: string[] = []) => ({
  required: true,
  content: { 'application/json': { schema: { type: 'object', required, properties } } },
});
const stallProps = {
  name: { type: 'string', example: 'Warung Bu Siti' },
  category: { type: 'string', example: 'Makanan Berat' },
  location: { type: 'string', example: 'Kantin Utama' },
  description: { type: 'string', example: 'Masakan rumahan' },
};

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'API Review Kantin',
    version: '1.0.0',
    description: 'Login lewat /auth/login, klik Authorize, lalu tempel token (tanpa kata Bearer).',
  },
  servers: [{ url: '/api' }],
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
  paths: {
    '/auth/register': { post: { tags: ['Auth'], summary: 'Register (role otomatis customer)',
      requestBody: json({
        name: { type: 'string', example: 'Tester Baru' },
        email: { type: 'string', example: 'tester@kantin.com' },
        password: { type: 'string', example: 'rahasia123' },
      }, ['name', 'email', 'password']),
      responses: R(201, 400, 409) } },
    '/auth/login': { post: { tags: ['Auth'], summary: 'Login, dapat token JWT',
      requestBody: json({
        email: { type: 'string', example: 'owner1@test.com' },
        password: { type: 'string', example: 'password123' },
      }, ['email', 'password']),
      responses: R(200, 400, 401) } },
    '/auth/me': { get: { tags: ['Auth'], security: secured, summary: 'Profil saya', responses: R(200, 401) } },

    '/stalls': {
      get: { tags: ['Stalls'], summary: 'List stall (publik)', parameters: [
        { name: 'search', in: 'query', schema: { type: 'string', maxLength: 100 } },
        { name: 'category', in: 'query', schema: { type: 'string', maxLength: 50 } },
        { name: 'location', in: 'query', schema: { type: 'string', maxLength: 100 } },
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['id', 'name', 'avgRating', 'createdAt'] } },
        { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } }],
        responses: R(200, 400) },
      post: { tags: ['Stalls'], security: secured, summary: 'Buat stall (owner, admin)',
        requestBody: json(stallProps, ['name']), responses: R(201, 400, 401, 403) } },
    '/stalls/{id}': {
      get: { tags: ['Stalls'], summary: 'Detail stall (publik)', parameters: [idParam], responses: R(200, 400, 404) },
      put: { tags: ['Stalls'], security: secured, summary: 'Ubah stall (owner miliknya, admin)',
        parameters: [idParam], requestBody: json(stallProps), responses: R(200, 400, 401, 403, 404) },
      delete: { tags: ['Stalls'], security: secured, summary: 'Hapus stall (admin)',
        parameters: [idParam], responses: R(200, 400, 401, 403, 404, 409) } },
    '/stalls/{id}/reviews': { post: { tags: ['Reviews'], security: secured,
      summary: 'Tambah review (semua role login)', parameters: [idParam],
      requestBody: json({
        rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
        comment: { type: 'string', maxLength: 1000, example: 'Enak dan murah' },
      }, ['rating']),
      responses: R(201, 400, 401, 404) } },

    '/reviews': { get: { tags: ['Reviews'], summary: 'List review (publik)', parameters: [
      { name: 'stallId', in: 'query', schema: { type: 'integer' } },
      { name: 'userId', in: 'query', schema: { type: 'integer' } }], responses: R(200, 400) } },
    '/reviews/{id}': {
      get: { tags: ['Reviews'], summary: 'Detail review (publik)', parameters: [idParam], responses: R(200, 400, 404) },
      delete: { tags: ['Reviews'], security: secured, summary: 'Hapus review (pemilik review / admin)',
        parameters: [idParam], responses: R(200, 400, 401, 403, 404) } },

    '/menu-items': {
      get: { tags: ['Menu'], summary: 'List menu (publik)', parameters: [
        { name: 'stallId', in: 'query', schema: { type: 'integer' } },
        { name: 'isAvailable', in: 'query', schema: { type: 'boolean' } }], responses: R(200, 400) },
      post: { tags: ['Menu'], security: secured, summary: 'Tambah menu (owner stall / admin)',
        requestBody: json({
          stallId: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Es Jeruk' },
          price: { type: 'integer', example: 6000 },
          isAvailable: { type: 'boolean', example: true },
        }, ['stallId', 'name', 'price']),
        responses: R(201, 400, 401, 403, 404) } },
    '/menu-items/{id}': {
      get: { tags: ['Menu'], summary: 'Detail menu (publik)', parameters: [idParam], responses: R(200, 400, 404) },
      put: { tags: ['Menu'], security: secured, summary: 'Ubah menu (owner stall / admin)', parameters: [idParam],
        requestBody: json({ name: { type: 'string' }, price: { type: 'integer' }, isAvailable: { type: 'boolean' } }),
        responses: R(200, 400, 401, 403, 404) },
      delete: { tags: ['Menu'], security: secured, summary: 'Hapus menu (owner stall / admin)', parameters: [idParam],
        responses: R(200, 400, 401, 403, 404) } },

    '/likes': { post: { tags: ['Likes'], security: secured, summary: 'Like review (semua role login)',
      requestBody: json({ reviewId: { type: 'integer', example: 1 } }, ['reviewId']),
      responses: R(201, 400, 401, 404, 409) } },
    '/likes/{id}': { delete: { tags: ['Likes'], security: secured, summary: 'Hapus like (pemilik / admin)',
      parameters: [idParam], responses: R(200, 400, 401, 403, 404) } },

    '/flags': { get: { tags: ['Flags'], security: secured, summary: 'List flag (admin)', parameters: [
      { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'reviewed', 'rejected'] } },
      { name: 'reviewId', in: 'query', schema: { type: 'integer' } }], responses: R(200, 400, 401, 403) } },
    '/flags/{id}': {
      get: { tags: ['Flags'], security: secured, summary: 'Detail flag (admin)', parameters: [idParam],
        responses: R(200, 400, 401, 403, 404) },
      put: { tags: ['Flags'], security: secured, summary: 'Ubah status flag (admin)', parameters: [idParam],
        requestBody: json({ status: { type: 'string', enum: ['pending', 'reviewed', 'rejected'] } }, ['status']),
        responses: R(200, 400, 401, 403, 404) } },

    '/audit': {
      get: { tags: ['Audit'], security: secured, summary: 'List audit log (admin)', parameters: [
        { name: 'userId', in: 'query', schema: { type: 'integer' } },
        { name: 'action', in: 'query', schema: { type: 'string' } },
        { name: 'targetTable', in: 'query', schema: { type: 'string' } }], responses: R(200, 400, 401, 403) },
      post: { tags: ['Audit'], security: secured, summary: 'Buat audit log (admin)',
        requestBody: json({
          action: { type: 'string', example: 'DELETE' },
          targetTable: { type: 'string', example: 'reviews' },
          targetId: { type: 'integer', example: 1 },
          metadata: { type: 'object' },
        }, ['action', 'targetTable', 'targetId']),
        responses: R(201, 400, 401, 403) } },

    '/users': { get: { tags: ['Users'], security: secured, summary: 'List user (admin)',
      responses: R(200, 401, 403) } },
  },
};