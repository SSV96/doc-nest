import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Documents } from './entities/documents.entity';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { DocumentStatusEnum } from './enum/document.status';
import { v4 as uuidv4 } from 'uuid';
import { AwsService } from '../common/aws/aws.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RolesEnum } from '../common/enum/roles.enum';
import { of, throwError } from 'rxjs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DocumentCreateDto } from './dto/document.create';
import { IFileMetaInfo } from './interface';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationMetaDto } from '../common/dto/paginated-resonse.dto';
describe('DocumentsService', () => {
  let service: DocumentsService;
  let documentsRepository: Repository<Documents>;
  let awsService: AwsService;
  let usersService: UsersService;
  let httpService: HttpService;

  // mock data
  const mockUser: User = {
    id: uuidv4(),
    email: 'test@example.com',
    password: 'XXXXXXXX',
    role: RolesEnum.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const fileMetaInfo: IFileMetaInfo = {
    originalName: 'employees-data.pdf',
    mimeType: 'application/pdf',
    size: 10,
    encoding: '7bit',
    fieldName: 'file',
  };

  const mockDocument = {
    id: uuidv4(),
    uploadedBy: mockUser.id,
    title: 'Test Document',
    url: 'https://aws.s3/test',
    metaInfo: fileMetaInfo,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: DocumentStatusEnum.UPLOADED,
  };
  const mockDocuments: Documents[] = [mockDocument];

  const queryBuilderMock = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([mockDocuments, 1]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getRepositoryToken(Documents),
          useValue: {
            save: jest.fn().mockResolvedValue(true),
            findOne: jest.fn(),
            find: jest.fn().mockResolvedValue(mockDocuments),
            remove: jest.fn().mockResolvedValue(null),
            createQueryBuilder: jest.fn(() => queryBuilderMock),
          },
        },
        {
          provide: AwsService,
          useValue: {
            uploadToS3: jest
              .fn()
              .mockResolvedValue('https://aws.s3/presigned-urlc'),
            deleteFromS3: jest.fn(),
            generatePreSignedUrl: jest
              .fn()
              .mockResolvedValue('https://aws.s3/presigned-url'),
            generatePreSignedUrlForExistingFile: jest
              .fn()
              .mockResolvedValue('http://mock-ingestion-url'),
          },
        },
        {
          provide: UsersService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn().mockReturnValue(of({ data: 'Success' })),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://mock-ingestion-url'),
          },
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    documentsRepository = module.get<Repository<Documents>>(
      getRepositoryToken(Documents),
    );
    awsService = module.get<AwsService>(AwsService);
    usersService = module.get<UsersService>(UsersService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload', () => {
    const fileUrl = 'https://mock-s3-url.com/test.pdf';

    const file = {
      buffer: Buffer.from('test'),
      originalname: 'test.pdf',
    } as Express.Multer.File;

    it('should throw exception if file not uploaded', async () => {
      let file: Express.Multer.File;
      await expect(service.upload(file, 'Test', mockUser.id)).rejects.toThrow(
        new BadRequestException('No file uploaded'),
      );
    });

    it('should throw exception if user not found', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);
      await expect(service.upload(file, 'Test', mockUser.id)).rejects.toThrow(
        new BadRequestException('User not found'),
      );
    });

    it('should upload a document and save it', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(awsService, 'uploadToS3').mockResolvedValue(fileUrl);
      jest.spyOn(documentsRepository, 'save').mockResolvedValue(mockDocument);

      const result = await service.upload(file, 'Test', mockUser.id);

      expect(result).toEqual(mockDocument);
      expect(awsService.uploadToS3).toHaveBeenCalledWith(file);
      expect(documentsRepository.save).toHaveBeenCalled();
    });
  });

  describe('create Document', () => {
    const dto: DocumentCreateDto = {
      title: 'Test Document',
      url: 'https://aws.s3./testdocument.',
      metaInfo: fileMetaInfo,
    };

    it('should throw exception if user not found', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);
      await expect(service.create(dto, 'user-id')).rejects.toThrow(
        new BadRequestException('User not found'),
      );
    });
    it('should create document', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(documentsRepository, 'save').mockResolvedValue(mockDocument);
      expect(service.create(dto, mockUser.id)).resolves.toBe(mockDocument);
    });
  });

  describe('getPresignedUrl', () => {
    it('should return a pre-signed URL', async () => {
      jest
        .spyOn(awsService, 'generatePreSignedUrl')
        .mockResolvedValue('https://aws.s3/presigned-url');
      const result = await service.getPresignedUrl(
        'test.pdf',
        'application/pdf',
      );
      expect(result).toBe('https://aws.s3/presigned-url');
      expect(awsService.generatePreSignedUrl).toHaveBeenCalledWith(
        'test.pdf',
        'application/pdf',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated documents with metadata', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        orderBy: 'DESC',
        sortBy: 'NEW',
      };

      const result = await service.findAll(mockUser.id, paginationDto);

      expect(documentsRepository.createQueryBuilder).toHaveBeenCalledWith(
        'documents',
      );

      expect(result.items).toHaveLength(1);
      expect(result.meta).toEqual(
        new PaginationMetaDto({
          page: 1,
          limit: 10,
          totalItems: 1,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a document by ID', async () => {
      jest
        .spyOn(documentsRepository, 'findOne')
        .mockResolvedValue(mockDocument);
      const result = await service.findOne('doc-id');
      expect(result).toEqual(mockDocument);
    });

    it('should throw exception if document is not found', async () => {
      jest.spyOn(documentsRepository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        new BadRequestException('Document not found'),
      );
    });
  });

  describe('remove', () => {
    it('should remove a document', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockDocument);
      jest.spyOn(awsService, 'deleteFromS3').mockResolvedValue(null);
      jest.spyOn(documentsRepository, 'remove').mockResolvedValue(null);
      const result = await service.remove('doc-id');
      expect(result).toEqual({ message: 'Document deleted successfully' });
    });

    it('should throw an exception if document is not found', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new BadRequestException('Document not found'));
      await expect(service.remove('invalid-id')).rejects.toThrow(
        new BadRequestException('Document not found'),
      );
    });
  });

  describe('triggerIngestion', () => {
    it('should throw exception if user not found', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);
      await expect(
        service.triggerIngestion(mockDocument.id, mockUser.id),
      ).rejects.toThrow(new NotFoundException('User not found'));
    });

    it('should throw exception if document not found', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(documentsRepository, 'findOne').mockResolvedValue(null);
      await expect(
        service.triggerIngestion(mockDocument.id, mockUser.id),
      ).rejects.toThrow(new NotFoundException('Document not found'));
    });

    it('should throw exception if user not found', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      jest
        .spyOn(documentsRepository, 'findOne')
        .mockResolvedValue({ ...mockDocument, uploadedBy: uuidv4() });
      await expect(
        service.triggerIngestion(mockDocument.id, mockUser.id),
      ).rejects.toThrow(
        new BadRequestException('Document is not created By User'),
      );
    });

    it('should trigger ingestion for a document', async () => {
      const user: User = {
        id: uuidv4(),
        email: 'test@example.com',
        password: 'XXXXXXXX',
        role: RolesEnum.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const document: Documents = {
        id: uuidv4(),
        uploadedBy: user.id,
        url: 'https://mock-s3-url.com/test.pdf',
        status: DocumentStatusEnum.UPLOADED,
        createdAt: new Date(),
        updatedAt: new Date(),
        title: 'Test',
        metaInfo: fileMetaInfo,
      };

      jest.spyOn(documentsRepository, 'findOne').mockResolvedValue(document);
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      jest
        .spyOn(awsService, 'generatePreSignedUrlForExistingFile')
        .mockResolvedValue('https://mock-s3-url.com/test.pdf');

      await service.triggerIngestion(document.id, user.id);
      expect(httpService.post).toHaveBeenCalledWith(
        'http://mock-ingestion-url',
        {
          documentId: document.id,
          fileUrl: 'https://mock-s3-url.com/test.pdf',
        },
      );
    });

    it('should throw BadRequestException when ingestion fails', async () => {
      const documentId = mockDocument.id;
      const userId = mockUser.id;

      jest
        .spyOn(documentsRepository, 'findOne')
        .mockResolvedValue(mockDocument);
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(
          throwError(() => new Error('Ingestion service unavailable')),
        );

      await expect(
        service.triggerIngestion(documentId, userId),
      ).rejects.toThrow(
        new BadRequestException(
          'Failed to trigger ingestion: Ingestion service unavailable',
        ),
      );
    });
  });
});
