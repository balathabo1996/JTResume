/**
 * @file swagger-spec.js
 * @description Source file for swagger-spec.js.
 * @author Thabotharan Balachandran
 */
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'JTResume API',
    version: '1.0.0',
    description: `Welcome to the JTResume API!

This API provides a complete backend for the JTResume Application, allowing users to build, manage, and AI-enhance professional resumes seamlessly.

🔑 Authentication
-----------------
The system uses **Cookie-based JWT Authentication**.

1. **Login** or **Register** to receive a secure HTTP-only cookie.
2. This cookie is automatically sent with subsequent requests.
3. **Note for API Tools (Postman/Swagger):** Ensure cookies are enabled/stored after login so protected endpoints can be tested.

📦 Primary Features
-------------------
This API is built explicitly to handle professional resume data operations.

* **Resume Management:** Access, create, and update resumes in standard JSON format.
* **AI Generation:** Leverages advanced AI models to optimize and rewrite resume bullet points instantly.
* **Secure Auth Flow:** End-to-end encrypted password hashing and stateless JWT sessions.
* **Contact Services:** Public gateways directly dispatch SMTP notifications without persistence overhead.

👥 User Roles
-------------
* **User:** Can view assigned resumes, update content, generate AI enhancements, and manage their profile.
* **Guest:** Can register new accounts, log in, and submit contact inquiries.`,
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
    '/ai/parse-linkedin': {
      post: {
        tags: ['AI Engine'],
        summary: 'Parse a LinkedIn PDF into resume JSON',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  pdfText: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Successfully parsed LinkedIn data.' },
          429: { description: 'Rate limit exceeded.' }
        }
      }
    },
    '/ai/interview': {
      post: {
        tags: ['AI Engine'],
        summary: 'Conduct an AI mock interview step',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  history: { type: 'array', items: { type: 'object' } },
                  resumeContext: { type: 'object' },
                  jobDescription: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'AI interview response.' }
        }
      }
    },
    '/ai/interview-evaluate': {
      post: {
        tags: ['AI Engine'],
        summary: 'Evaluate an AI mock interview transcript',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  messages: { type: 'array', items: { type: 'object' } },
                  resumeData: { type: 'object' },
                  jobDescription: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Evaluation and feedback.' }
        }
      }
    },
    '/ai/skill-gap': {
      post: {
        tags: ['AI Engine'],
        summary: 'Analyze skill gaps and generate learning paths',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  missingSkills: { type: 'array', items: { type: 'string' } },
                  jobDescription: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Generated learning paths.' }
        }
      }
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
    '/auth/sso': {
      post: {
        tags: ['Authentication'],
        summary: 'Initiate SAML/SSO login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'SSO initiation URL returned.' }
        }
      }
    },
    '/auth/oauth-exchange': {
      post: {
        tags: ['Authentication'],
        summary: 'Exchange OAuth token for local session',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'OAuth logged in successfully.' }
        }
      }
    },
    '/user/delete': {
      post: {
        tags: ['Authentication'],
        summary: 'Delete user account and all associated data',
        responses: {
          200: { description: 'Account deleted successfully.' }
        }
      }
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
    '/resumes/{id}/duplicate': {
      post: {
        tags: ['Resumes'],
        summary: 'Duplicate an existing resume',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          201: { description: 'Resume duplicated.' },
        },
      },
    },
    '/resumes/share/{slug}': {
      get: {
        tags: ['Resumes'],
        summary: 'Fetch a public shared resume',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Returns the shared resume.' },
        },
      },
    },
  },
};
