import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documents } from './entities/documents.entity';
import { AwsService } from '../common/aws/aws.service';
import { UsersService } from '../users/users.service';
import { DocumentStatusEnum } from './enum/document.status';
import { DocumentCreateDto } from './dto/document.create';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
} from '../common/dto/paginated-resonse.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
@Injectable()
export class DocumentsService {
  ingestionServiceUrl: string;
  constructor(
    @InjectRepository(Documents)
    private readonly documentsRepository: Repository<Documents>,
    private readonly awsService: AwsService,
    private readonly userService: UsersService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.ingestionServiceUrl = this.configService.get<string>(
      'microservice.ingestionServiceUrl',
    );
  }

  async upload(file: Express.Multer.File, title: string, userId: string) {
    if (!file) throw new BadRequestException('No file uploaded');

    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const fileUrl = await this.awsService.uploadToS3(file);

    const document = await this.documentsRepository.save({
      uploadedBy: user.id,
      title,
      url: fileUrl,
      metaInfo: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        encoding: file.encoding,
        fieldName: file.fieldname,
      },
      status: DocumentStatusEnum.UPLOADED,
    });

    return await this.documentsRepository.save(document);
  }

  async create(dto: DocumentCreateDto, userId: string) {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }
    return await this.documentsRepository.save({
      uploadedBy: user.id,
      title: dto.title,
      url: dto.url,
      metaInfo: dto.metaInfo,
      status: DocumentStatusEnum.UPLOADED,
    });
  }

  async getPresignedUrl(fileName: string, fileType: string) {
    return this.awsService.generatePreSignedUrl(fileName, fileType);
  }

  async findAll(
    uploadedBy: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Documents>> {
    const { page, limit, orderBy } = paginationDto;
    const skip = (page - 1) * limit;
    const [items, totalItems] = await this.documentsRepository
      .createQueryBuilder('documents')
      .where('documents.uploadedBy= :uploadedBy', { uploadedBy })
      .orderBy('documents.createdAt', orderBy)
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    const meta = new PaginationMetaDto({
      page,
      limit,
      totalItems,
    });
    return {
      items,
      meta,
    };
  }

  async findOne(id: string) {
    const document = await this.documentsRepository.findOne({ where: { id } });
    if (!document) throw new BadRequestException('Document not found');
    return document;
  }

  async remove(id: string) {
    const document = await this.findOne(id);
    Promise.all([
      this.awsService.deleteFromS3(document.url),
      this.documentsRepository.remove(document),
    ]);
    return { message: 'Document deleted successfully' };
  }

  async triggerIngestion(documentId: string, userId: string): Promise<void> {
    const document = await this.documentsRepository.findOne({
      where: { id: documentId },
    });
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!(user.id === document.uploadedBy)) {
      throw new BadRequestException('Document is not created By User');
    }

    const preSignedUrl =
      await this.awsService.generatePreSignedUrlForExistingFile(
        document.url,
        document.metaInfo.mimeType,
      );

    try {
      await lastValueFrom(
        this.httpService.post(this.ingestionServiceUrl, {
          documentId,
          fileUrl: preSignedUrl,
        }),
      );

      await this.documentsRepository.save(document);
    } catch (error) {
      throw new BadRequestException(
        `Failed to trigger ingestion: ${error.message}`,
      );
    }
  }
}
