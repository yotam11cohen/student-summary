export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Student Summary API',
    description:
      'REST API for the bilingual teacher observation and AI summary application.',
    version: '1.0.0',
  },
  servers: [{ url: '/api', description: 'API base' }],
  tags: [
    { name: 'Students', description: 'Student management' },
    { name: 'Notes', description: 'Observation notes per student' },
    { name: 'Summary', description: 'AI-generated end-of-year summaries' },
  ],
  paths: {
    '/students': {
      get: {
        tags: ['Students'],
        summary: 'List all students',
        description: 'Returns all students ordered by creation date ascending.',
        responses: {
          '200': {
            description: 'Array of students',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Student' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Students'],
        summary: 'Create a student',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateStudentRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created student',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Student' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/students/{id}': {
      delete: {
        tags: ['Students'],
        summary: 'Delete a student',
        description: 'Deletes the student and all their notes (cascade).',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          '204': { description: 'Deleted successfully' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/notes': {
      get: {
        tags: ['Notes'],
        summary: 'List notes for a student',
        description: 'Returns all notes for the given student, newest first.',
        parameters: [
          {
            name: 'studentId',
            in: 'query',
            required: true,
            schema: { type: 'integer' },
            description: 'ID of the student',
          },
        ],
        responses: {
          '200': {
            description: 'Array of notes',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Note' },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
        },
      },
      post: {
        tags: ['Notes'],
        summary: 'Add a note',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateNoteRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created note',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Note' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/notes/{id}': {
      delete: {
        tags: ['Notes'],
        summary: 'Delete a note',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          '204': { description: 'Deleted successfully' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/summary': {
      post: {
        tags: ['Summary'],
        summary: 'Generate an AI summary',
        description:
          'Proxies to the Anthropic Claude API and returns a structured end-of-year summary in the requested language.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SummaryRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Generated summary text',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SummaryResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '502': {
            description: 'Anthropic API call failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Student: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Yael Cohen' },
          created_at: {
            type: 'string',
            format: 'date-time',
            example: '2026-04-01T10:00:00Z',
          },
        },
        required: ['id', 'name', 'created_at'],
      },
      Note: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 12 },
          student_id: { type: 'integer', example: 1 },
          content: {
            type: 'string',
            example: 'Helped a classmate without being asked.',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            example: '2026-04-01T11:30:00Z',
          },
        },
        required: ['id', 'student_id', 'content', 'created_at'],
      },
      CreateStudentRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 200, example: 'Yael Cohen' },
        },
        required: ['name'],
      },
      CreateNoteRequest: {
        type: 'object',
        properties: {
          studentId: { type: 'integer', example: 1 },
          content: {
            type: 'string',
            minLength: 1,
            example: 'Showed strong comprehension today.',
          },
        },
        required: ['studentId', 'content'],
      },
      SummaryRequest: {
        type: 'object',
        properties: {
          studentId: { type: 'integer', example: 1 },
          studentName: { type: 'string', example: 'Yael Cohen' },
          notes: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            example: ['Great focus today.', 'Helped classmates during group work.'],
          },
          language: {
            type: 'string',
            enum: ['en', 'he'],
            example: 'en',
          },
        },
        required: ['studentId', 'studentName', 'notes', 'language'],
      },
      SummaryResponse: {
        type: 'object',
        properties: {
          summary: {
            type: 'string',
            example: '1. General Behavior\nYael demonstrates...',
          },
        },
        required: ['summary'],
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Student not found' },
        },
        required: ['error'],
      },
    },
    parameters: {
      IdParam: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
        description: 'Resource ID',
      },
    },
    responses: {
      BadRequest: {
        description: 'Invalid request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
  },
};
