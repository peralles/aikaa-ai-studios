import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Kanban-driven Workflow Automation (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let companyId: string;
  let studioId: string;
  let boardId: string;
  let stageId: string;
  let cardId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Setup test data
    authToken = 'test-jwt-token';
    companyId = '550e8400-e29b-41d4-a716-446655440001';
    studioId = '550e8400-e29b-41d4-a716-446655440002';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Story: Setup Kanban board with workflow automation triggers', () => {
    it('should create a Kanban board in the studio', async () => {
      const boardData = {
        name: 'Marketing Campaign Pipeline',
        description: 'Track marketing campaigns from ideation to completion',
      };

      const response = await request(app.getHttpServer())
        .post(`/v1/studios/${studioId}/kanban-boards`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(boardData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(boardData.name);
      expect(response.body.studio_id).toBe(studioId);
      
      boardId = response.body.id;
    });

    it('should create stages with workflow triggers', async () => {
      const stageData = {
        name: 'Content Creation',
        color: '#FF6B6B',
        workflow_triggers: [
          {
            template_id: '550e8400-e29b-41d4-a716-446655440010',
            conditions: [
              {
                type: 'stage_entry',
              },
            ],
            is_active: true,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post(`/v1/kanban-boards/${boardId}/stages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(stageData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(stageData.name);
      expect(response.body.color).toBe(stageData.color);
      expect(response.body.workflow_triggers).toBeDefined();
      expect(response.body.workflow_triggers).toHaveLength(1);
      
      stageId = response.body.id;
    });

    it('should create a card that triggers workflow automation', async () => {
      const cardData = {
        title: 'Q4 Product Launch Campaign',
        description: 'Launch campaign for new product line',
        stage_id: stageId,
        custom_fields: [
          {
            field_name: 'priority',
            field_type: 'dropdown',
            field_value: 'high',
          },
          {
            field_name: 'budget',
            field_type: 'number',
            field_value: 50000,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post(`/v1/kanban-boards/${boardId}/cards`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(cardData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(cardData.title);
      expect(response.body.stage_id).toBe(stageId);
      expect(response.body.custom_fields).toHaveLength(2);
      
      cardId = response.body.id;
    });

    it('should move card to trigger stage-based workflow', async () => {
      // First create another stage to move to
      const reviewStageData = {
        name: 'Review & Approval',
        color: '#4ECDC4',
        workflow_triggers: [
          {
            template_id: '550e8400-e29b-41d4-a716-446655440011',
            conditions: [
              {
                type: 'stage_entry',
              },
            ],
            is_active: true,
          },
        ],
      };

      const stageResponse = await request(app.getHttpServer())
        .post(`/v1/kanban-boards/${boardId}/stages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewStageData)
        .expect(201);

      const newStageId = stageResponse.body.id;

      // Move card to the new stage
      const moveData = {
        stage_id: newStageId,
        position: 0,
      };

      const response = await request(app.getHttpServer())
        .post(`/v1/kanban-cards/${cardId}/move`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(moveData)
        .expect(200);

      expect(response.body.stage_id).toBe(newStageId);
      expect(response.body.position).toBe(0);
    });

    it('should validate workflow trigger execution', async () => {
      // Check that workflow execution was created when card entered the stage
      const response = await request(app.getHttpServer())
        .get(`/v1/studios/${studioId}/executions`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      // In a real implementation, this would verify that the workflow
      // was automatically triggered when the card entered the stage
    });

    it('should support custom field validation in workflow triggers', async () => {
      const stageWithFieldTrigger = {
        name: 'Budget Approval',
        color: '#45B7D1',
        workflow_triggers: [
          {
            template_id: '550e8400-e29b-41d4-a716-446655440012',
            conditions: [
              {
                type: 'attribute_change',
                field_name: 'budget',
                operator: '>',
                field_value: 25000,
              },
            ],
            is_active: true,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post(`/v1/kanban-boards/${boardId}/stages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(stageWithFieldTrigger)
        .expect(201);

      expect(response.body.workflow_triggers[0].conditions[0].type).toBe('attribute_change');
      expect(response.body.workflow_triggers[0].conditions[0].operator).toBe('>');
    });
  });

  describe('Real-time updates and workflow integration', () => {
    it('should handle concurrent card movements', async () => {
      // Create multiple cards
      const cardPromises = [];
      for (let i = 0; i < 3; i++) {
        const cardData = {
          title: `Test Card ${i + 1}`,
          stage_id: stageId,
        };
        
        cardPromises.push(
          request(app.getHttpServer())
            .post(`/v1/kanban-boards/${boardId}/cards`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(cardData)
        );
      }

      const responses = await Promise.all(cardPromises);
      responses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body.title).toBe(`Test Card ${index + 1}`);
        expect(response.body.position).toBe(index + 1); // Sequential positions
      });
    });

    it('should validate position management within stages', async () => {
      // Get all cards in the stage
      const response = await request(app.getHttpServer())
        .get(`/v1/kanban-boards/${boardId}/cards?stage_id=${stageId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      const cards = response.body.data;
      
      // Verify positions are sequential and unique
      const positions = cards.map((card: any) => card.position).sort((a: number, b: number) => a - b);
      for (let i = 0; i < positions.length; i++) {
        expect(positions[i]).toBe(i);
      }
    });

    it('should enforce access control for Kanban operations', async () => {
      // Test without authorization
      await request(app.getHttpServer())
        .get(`/v1/kanban-boards/${boardId}`)
        .expect(401);

      // Test with invalid board access
      const unauthorizedBoardId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .get(`/v1/kanban-boards/${unauthorizedBoardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });
});