import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { DocumentsService } from './documents.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesEnum } from '../common/enum/roles.enum';
import { DocumentCreateDto } from './dto/document.create';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a document' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @CurrentUser('userId') userId: string,
  ) {
    if (!file) throw new BadRequestException('File is required');
    return await this.documentsService.upload(file, title, userId);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a document record' })
  @ApiBody({ type: DocumentCreateDto })
  async create(
    @Body('documentCreateDto') documentCreate: DocumentCreateDto,
    @CurrentUser('userId') userId: string,
  ) {
    return await this.documentsService.create(documentCreate, userId);
  }

  @Post('get-presigned-url')
  @ApiOperation({ summary: 'Get a pre-signed URL for S3 upload' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileName: { type: 'string' },
        fileType: { type: 'string' },
      },
    },
  })
  async getPreSignedUrl(
    @Body('fileName') fileName: string,
    @Body('fileType') fileType: string,
  ) {
    return await this.documentsService.getPresignedUrl(fileName, fileType);
  }

  @UseGuards(RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Get('find_by_user/:user_id')
  @ApiOperation({ summary: 'Find all documents by user ID (Admin only)' })
  findByUser(@Param('user_id') user_id: string) {
    return this.documentsService.findAll(user_id);
  }

  @Get('find_my_documents')
  @ApiOperation({ summary: 'Find all documents for the authenticated user' })
  findMyDocuments(@CurrentUser('userId') userId: string) {
    return this.documentsService.findAll(userId);
  }

  @Get('find/:id')
  @ApiOperation({ summary: 'Find a document by ID' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Delete('remove/:id')
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.ADMIN, RolesEnum.EDITOR)
  @ApiOperation({ summary: 'Remove a document (Admin/Editor only)' })
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }

  @Post(':id/ingest')
  @ApiOperation({ summary: 'Trigger document ingestion process' })
  triggerIngestion(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.documentsService.triggerIngestion(id, userId);
  }
}
