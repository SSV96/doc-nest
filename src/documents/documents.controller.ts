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
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { DocumentsService } from './documents.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthenticatedRequest } from 'src/common/interface';
import { RolesEnum } from 'src/common/enum/roles.enum';
import { DocumentCreateDto } from './dto/document.create';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) throw new BadRequestException('File is required');
    return await this.documentsService.upload(file, title, req.me.userId);
  }

  @Post('create')
  async create(
    @Body('documentCreateDto') documentCreate: DocumentCreateDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.documentsService.create(documentCreate, req.me.userId);
  }

  @Post('get-presigned-url')
  async getPreSignedUrl(
    @Body('fileName') fileName: string,
    @Body('fileType') fileType: string,
  ) {
    return await this.documentsService.getPresignedUrl(fileName, fileType);
  }

  @UseGuards(RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Get('find_by_user/:user_id')
  findByUser(@Param('user_id') user_id: string) {
    return this.documentsService.findAll(user_id);
  }

  @Get('find_my_documents')
  findMyDocuments(@Req() req: AuthenticatedRequest) {
    return this.documentsService.findAll(req.me.userId);
  }

  @Get('find/:id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Delete('remove/:id')
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.ADMIN, RolesEnum.EDITOR)
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }

  @Post(':id/ingest')
  triggerIngestion(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.documentsService.triggerIngestion(id, req.me.userId);
  }
}
