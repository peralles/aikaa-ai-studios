// Global test setup for Jest
import 'reflect-metadata';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.ACTIVEPIECES_API_URL = 'http://localhost:3001';
process.env.ACTIVEPIECES_API_KEY = 'test-api-key';

// Increase test timeout for integration tests
jest.setTimeout(30000);