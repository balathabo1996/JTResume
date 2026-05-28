export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'JTResume API',
    version: '1.0.0',
    description: 'API Documentation for JTResume (AI, Auth, Contact, Resumes).',
  },
  servers: [
    {
      url: '/api',
      description: 'API Base URL',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
      },
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
  paths: {
    '/ai/enhance-bullet': {
      post: {
        tags: ['AI Engine'],
        summary: 'Enhance an experience bullet point',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  content: { type: 'string', example: 'Fixed bugs in the app.' },
                  role: { type: 'string', example: 'Software Engineer' },
                  company: { type: 'string', example: 'Tech Innovations' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Enhanced content successfully returned.' },
        },
      },
    },
    '/ai/generate-summary': {
      post: {
        tags: ['AI Engine'],
        summary: 'Generate a professional summary',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  jobTitle: { type: 'string', example: 'Full Stack Developer' },
                  keywords: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['React', 'Node.js', 'Leadership'],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Generated summary returned.' },
        },
      },
    },
    '/ai/generate-cover-letter': {
      post: {
        tags: ['AI Engine'],
        summary: 'Generate a cover letter',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  resumeData: { type: 'object' },
                  jobDescription: { type: 'string' },
                  hiringManager: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Generated cover letter.' },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered.' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Logged in successfully.' },
          401: { description: 'Invalid credentials.' },
        },
      },
    },
    '/auth/change-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Change user password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password changed successfully.' },
        },
      },
    },
    '/auth/update-profile': {
      post: {
        tags: ['Authentication'],
        summary: 'Update user profile (name/email)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated.' },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Send password reset link',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Reset email sent.' },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Reset password via token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string' },
                  newPassword: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password reset successfully.' },
        },
      },
    },
    '/contact': {
      post: {
        tags: ['Contact'],
        summary: 'Submit a contact form message',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  subject: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Message sent.' },
        },
      },
    },
    '/resumes': {
      get: {
        tags: ['Resumes'],
        summary: 'List all resumes for the authenticated user',
        responses: {
          200: { description: 'Returns an array of resumes.' },
        },
      },
      post: {
        tags: ['Resumes'],
        summary: 'Create a new resume',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'The full resume state object (formData)',
              },
            },
          },
        },
        responses: {
          201: { description: 'Resume created successfully.' },
        },
      },
    },
    '/resumes/{id}': {
      get: {
        tags: ['Resumes'],
        summary: 'Get a specific resume by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Returns the resume.' },
        },
      },
      put: {
        tags: ['Resumes'],
        summary: 'Update a specific resume by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
              },
            },
          },
        },
        responses: {
          200: { description: 'Resume updated successfully.' },
        },
      },
      delete: {
        tags: ['Resumes'],
        summary: 'Delete a specific resume by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Resume deleted.' },
        },
      },
    },
  },
};
