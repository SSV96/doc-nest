import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documents } from './entities/documents.entity';
import { AwsService } from 'src/common/aws/aws.service';
import { UsersService } from 'src/users/users.service';
import { DocumentStatusEnum } from './enum/document.status';
import { DocumentCreateDto } from './dto/document.create';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Documents)
    private readonly documentsRepository: Repository<Documents>,
    private readonly awsService: AwsService,
    private readonly userService: UsersService,
  ) {}

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
      status: DocumentStatusEnum.UPLOADED,
    });
  }
  async getPresignedUrl(fileName: string, fileType: string) {
    return this.awsService.generatePreSignedUrl(fileName, fileType);
  }

  async findAll(uploadedBy: string) {
    return await this.documentsRepository.find({
      where: { uploadedBy },
    });
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
}
