/**
 * Especificación OpenAPI 3.0 para la API
 *
 * Documentación completa de todos los endpoints.
 * Se expone en /api/docs
 */

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Sistema de Gestión de Ingresos y Gastos',
    description:
      'API para gestionar movimientos financieros, usuarios y reportes.',
    version: '1.0.0',
    contact: {
      name: 'Soporte',
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
      description: 'Servidor actual',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Autenticación y sesión' },
    { name: 'Movements', description: 'Gestión de ingresos y egresos' },
    { name: 'Users', description: 'Gestión de usuarios' },
    { name: 'Reports', description: 'Reportes y estadísticas' },
  ],
  paths: {
    '/api/me': {
      get: {
        tags: ['Auth'],
        summary: 'Obtener usuario actual',
        description:
          'Retorna los datos del usuario autenticado incluyendo su rol.',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Datos del usuario',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    image: { type: 'string', nullable: true },
                    role: { type: 'string', enum: ['USER', 'ADMIN'] },
                  },
                },
                example: {
                  id: 'user123',
                  name: 'Juan Pérez',
                  email: 'juan@example.com',
                  image: 'https://github.com/avatar.png',
                  role: 'ADMIN',
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/movements': {
      get: {
        tags: ['Movements'],
        summary: 'Listar movimientos',
        description:
          'Obtiene la lista de todos los movimientos con paginación opcional.',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Número de página',
            schema: { type: 'integer', default: 1, minimum: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Items por página',
            schema: { type: 'integer', default: 50, minimum: 1, maximum: 100 },
          },
          {
            name: 'type',
            in: 'query',
            description: 'Filtrar por tipo de movimiento',
            schema: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de movimientos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    movements: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Movement' },
                    },
                    total: { type: 'integer' },
                  },
                },
                example: {
                  movements: [
                    {
                      id: 'clx123abc',
                      concept: 'Salario mensual',
                      amount: 5000,
                      type: 'INCOME',
                      date: '2024-01-15T00:00:00.000Z',
                      user: { id: 'user123', name: 'Juan Pérez' },
                    },
                  ],
                  total: 1,
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Movements'],
        summary: 'Crear movimiento',
        description: 'Crea un nuevo movimiento. Solo ADMIN.',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMovement' },
              example: {
                concept: 'Pago de servicios',
                amount: 150.5,
                type: 'EXPENSE',
                date: '2024-01-20',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Movimiento creado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Movement' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'Listar usuarios',
        description: 'Obtiene la lista de todos los usuarios. Solo ADMIN.',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de usuarios',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    users: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                    total: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/users/{id}': {
      put: {
        tags: ['Users'],
        summary: 'Editar usuario',
        description: 'Actualiza nombre y/o rol de un usuario. Solo ADMIN.',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID del usuario',
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUser' },
              example: {
                name: 'Nuevo Nombre',
                role: 'USER',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Usuario actualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/reports': {
      get: {
        tags: ['Reports'],
        summary: 'Obtener datos del reporte',
        description: 'Retorna estadísticas y datos para gráficos. Solo ADMIN.',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Datos del reporte',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Report' },
                example: {
                  balance: 4500,
                  totalIncome: 10000,
                  totalExpense: 5500,
                  movementsCount: 25,
                  monthlyData: [
                    { month: '2024-01', income: 5000, expense: 2500 },
                    { month: '2024-02', income: 5000, expense: 3000 },
                  ],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/reports/csv': {
      get: {
        tags: ['Reports'],
        summary: 'Descargar reporte CSV',
        description:
          'Descarga todos los movimientos en formato CSV. Solo ADMIN.',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Archivo CSV',
            content: {
              'text/csv': {
                schema: { type: 'string', format: 'binary' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'better-auth.session_token',
        description: 'Sesión de Better Auth (cookie)',
      },
    },
    schemas: {
      Movement: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          concept: { type: 'string' },
          amount: { type: 'number' },
          type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
          date: { type: 'string', format: 'date-time' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
      },
      CreateMovement: {
        type: 'object',
        required: ['concept', 'amount', 'type', 'date'],
        properties: {
          concept: { type: 'string', minLength: 1 },
          amount: { type: 'number', minimum: 0.01 },
          type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
          date: { type: 'string', format: 'date' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string', nullable: true },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
          image: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      UpdateUser: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
        },
      },
      Report: {
        type: 'object',
        properties: {
          balance: { type: 'number' },
          totalIncome: { type: 'number' },
          totalExpense: { type: 'number' },
          movementsCount: { type: 'integer' },
          monthlyData: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                month: { type: 'string' },
                income: { type: 'number' },
                expense: { type: 'number' },
              },
            },
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          details: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Datos inválidos',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      Unauthorized: {
        description: 'No autenticado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              error: 'Unauthorized',
              message: 'Debes iniciar sesión para acceder a este recurso',
            },
          },
        },
      },
      Forbidden: {
        description: 'Sin permisos',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              error: 'Forbidden',
              message: 'No tienes permisos para acceder a este recurso',
            },
          },
        },
      },
      NotFound: {
        description: 'Recurso no encontrado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
  },
};
