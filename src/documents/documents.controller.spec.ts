import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { UsersService } from '../users/users.service';
import { AwsService } from '../common/aws/aws.service';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Documents } from './entities/documents.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('DocumentsController', () => {
  let controller: DocumentsController;

  beforeEach(async () => {
    const mockJwtAuthGuard = {
      canActivate: jest.fn(() => true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        DocumentsService,
        { provide: getRepositoryToken(Documents), useValue: {} },
        { provide: UsersService, useValue: {} },
        { provide: AwsService, useValue: {} },
        { provide: HttpService, useValue: { post: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://mock-ingestion-url'),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<DocumentsController>(DocumentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
