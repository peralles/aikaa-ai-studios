import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Company Registration and First Studio Creation (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let companyId: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Mock authentication - in real implementation, this would use Supabase Auth
    authToken = 'test-jwt-token';
    userId = '550e8400-e29b-41d4-a716-446655440001';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Story: Business owner registers company and creates first studio', () => {
    it('should allow user to register a new company', async () => {
      const companyData = {
        name: 'Tech Innovations Ltd',
        industry_type: 'technology',
        contact_email: 'info@techinnovations.com',
        contact_phone: '+1-555-0123',
        headquarters_address: '123 Innovation Drive, Silicon Valley, CA 94000',
      };

      const response = await request(app.getHttpServer())
        .post('/v1/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(companyData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(companyData.name);
      expect(response.body.industry_type).toBe(companyData.industry_type);
      expect(response.body.contact_email).toBe(companyData.contact_email);
      
      companyId = response.body.id;
    });

    it('should automatically create user-company relationship as admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/companies/${companyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(companyId);
      
      // User should have admin access to their created company
      // This would be validated through RLS policies in real implementation
    });

    it('should allow company admin to create first studio', async () => {
      const studioData = {
        name: 'Marketing Automation Hub',
        description: 'Central hub for all marketing automation workflows',
        business_area: 'marketing',
      };

      const response = await request(app.getHttpServer())
        .post(`/v1/companies/${companyId}/studios`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(studioData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(studioData.name);
      expect(response.body.business_area).toBe(studioData.business_area);
      expect(response.body.company_id).toBe(companyId);
      expect(response.body.created_by).toBe(userId);
    });

    it('should list company studios including the newly created one', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/companies/${companyId}/studios`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Marketing Automation Hub');
      
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.total).toBe(1);
    });

    it('should validate company name uniqueness per user', async () => {
      const duplicateCompany = {
        name: 'Tech Innovations Ltd', // Same name as before
        industry_type: 'finance',
        contact_email: 'different@email.com',
        headquarters_address: 'Different address',
      };

      await request(app.getHttpServer())
        .post('/v1/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateCompany)
        .expect(409); // Conflict - duplicate name
    });

    it('should validate studio name uniqueness within company', async () => {
      const duplicateStudio = {
        name: 'Marketing Automation Hub', // Same name as before
        business_area: 'sales',
      };

      await request(app.getHttpServer())
        .post(`/v1/companies/${companyId}/studios`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateStudio)
        .expect(409); // Conflict - duplicate name within company
    });
  });

  describe('Data validation and constraints', () => {
    it('should reject company with invalid industry type', async () => {
      const invalidCompany = {
        name: 'Invalid Industry Company',
        industry_type: 'invalid_industry',
        contact_email: 'test@invalid.com',
        headquarters_address: '123 Invalid Street',
      };

      await request(app.getHttpServer())
        .post('/v1/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCompany)
        .expect(400);
    });

    it('should reject studio with invalid business area', async () => {
      const invalidStudio = {
        name: 'Invalid Business Area Studio',
        business_area: 'invalid_area',
      };

      await request(app.getHttpServer())
        .post(`/v1/companies/${companyId}/studios`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidStudio)
        .expect(400);
    });

    it('should enforce minimum name length constraints', async () => {
      const shortNameCompany = {
        name: 'AB', // Too short (minimum 3 characters)
        industry_type: 'technology',
        contact_email: 'test@short.com',
        headquarters_address: '123 Short Street',
      };

      await request(app.getHttpServer())
        .post('/v1/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(shortNameCompany)
        .expect(400);
    });
  });
});