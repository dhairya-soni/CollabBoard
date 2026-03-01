import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

/* ── Full OpenAPI 3.0 specification ── */
const spec = {
  openapi: '3.0.0',
  info: {
    title: 'CollabBoard API',
    version: '1.0.0',
    description:
      'REST API for CollabBoard — a collaborative project management tool with real-time features and infinite canvas.',
  },
  servers: [{ url: '/api', description: 'API Server' }],
  tags: [
    { name: 'Auth', description: 'Authentication & user management' },
    { name: 'Workspaces', description: 'Workspace CRUD & membership' },
    { name: 'Projects', description: 'Project management' },
    { name: 'Tasks', description: 'Task CRUD, filtering, ordering' },
    { name: 'Comments', description: 'Task comments' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'string' },
              details: { type: 'array', items: { type: 'object' } },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          avatar: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Workspace: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          ownerId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          _count: {
            type: 'object',
            properties: {
              projects: { type: 'integer' },
              members: { type: 'integer' },
            },
          },
        },
      },
      Project: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'] },
          workspaceId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          _count: { type: 'object', properties: { tasks: { type: 'integer' } } },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: {
            type: 'string',
            enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'],
          },
          priority: { type: 'string', enum: ['URGENT', 'HIGH', 'MEDIUM', 'LOW', 'NONE'] },
          projectId: { type: 'string' },
          assigneeId: { type: 'string', nullable: true },
          creatorId: { type: 'string' },
          dueDate: { type: 'string', format: 'date-time', nullable: true },
          position: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Comment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          content: { type: 'string' },
          taskId: { type: 'string' },
          userId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', minLength: 8, example: 'password123' },
                  name: { type: 'string', example: 'John Doe' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User created — returns user object + JWT token' },
          '409': { description: 'Email already exists' },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful — returns user + JWT token' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user',
        responses: {
          '200': { description: 'Current user profile' },
          '401': { description: 'Not authenticated' },
        },
      },
    },
    '/workspaces': {
      get: {
        tags: ['Workspaces'],
        summary: 'List workspaces for current user',
        responses: { '200': { description: 'Array of workspaces' } },
      },
      post: {
        tags: ['Workspaces'],
        summary: 'Create a new workspace',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'slug'],
                properties: {
                  name: { type: 'string', example: 'Acme Corp' },
                  slug: { type: 'string', example: 'acme-corp' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Workspace created' },
          '409': { description: 'Slug already taken' },
        },
      },
    },
    '/workspaces/{id}': {
      get: {
        tags: ['Workspaces'],
        summary: 'Get workspace by ID (with members)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Workspace details' }, '404': { description: 'Not found' } },
      },
      patch: {
        tags: ['Workspaces'],
        summary: 'Update workspace (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  slug: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Updated workspace' }, '403': { description: 'Forbidden' } },
      },
      delete: {
        tags: ['Workspaces'],
        summary: 'Delete workspace (owner only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Deleted' }, '403': { description: 'Forbidden' } },
      },
    },
    '/workspaces/{id}/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List projects in a workspace',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Array of projects' } },
      },
    },
    '/projects': {
      post: {
        tags: ['Projects'],
        summary: 'Create a new project',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'workspaceId'],
                properties: {
                  name: { type: 'string', example: 'Frontend Revamp' },
                  description: { type: 'string' },
                  workspaceId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Project created' } },
      },
    },
    '/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Get project by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Project details' } },
      },
      patch: {
        tags: ['Projects'],
        summary: 'Update project',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Updated project' } },
      },
      delete: {
        tags: ['Projects'],
        summary: 'Delete project (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Deleted' } },
      },
    },
    '/projects/{id}/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List tasks in a project (with optional filters)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['URGENT', 'HIGH', 'MEDIUM', 'LOW', 'NONE'] } },
          { name: 'assigneeId', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Array of tasks' } },
      },
    },
    '/tasks': {
      post: {
        tags: ['Tasks'],
        summary: 'Create a new task',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'projectId'],
                properties: {
                  title: { type: 'string', example: 'Implement user authentication' },
                  description: { type: 'string' },
                  status: { type: 'string', enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'] },
                  priority: { type: 'string', enum: ['URGENT', 'HIGH', 'MEDIUM', 'LOW', 'NONE'] },
                  projectId: { type: 'string' },
                  assigneeId: { type: 'string', nullable: true },
                  dueDate: { type: 'string', format: 'date-time', nullable: true },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Task created' } },
      },
    },
    '/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get task by ID (with comments & attachments)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Task details with nested data' } },
      },
      patch: {
        tags: ['Tasks'],
        summary: 'Update task',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Updated task' } },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete task',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Deleted' } },
      },
    },
    '/tasks/{taskId}/comments': {
      get: {
        tags: ['Comments'],
        summary: 'List comments on a task',
        parameters: [{ name: 'taskId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Array of comments' } },
      },
    },
    '/comments': {
      post: {
        tags: ['Comments'],
        summary: 'Add comment to a task',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content', 'taskId'],
                properties: {
                  content: { type: 'string', example: 'Looks good, ready for review!' },
                  taskId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Comment created' } },
      },
    },
    '/comments/{id}': {
      patch: {
        tags: ['Comments'],
        summary: 'Update own comment',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Updated comment' } },
      },
      delete: {
        tags: ['Comments'],
        summary: 'Delete own comment',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Deleted' } },
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'CollabBoard API Docs',
    }),
  );
}
