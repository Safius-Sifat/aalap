import {
  BadRequestException,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Avatar must be an image file'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder = 'avatars',
  ) {
    if (!file) {
      throw new BadRequestException('file is required');
    }

    return this.uploadService.uploadPublicFile(file.buffer, file.mimetype, folder, file.originalname);
  }

  @Post('media')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 64 * 1024 * 1024 },
    }),
  )
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder = 'chat-media',
  ) {
    if (!file) {
      throw new BadRequestException('file is required');
    }

    return this.uploadService.uploadPublicFile(file.buffer, file.mimetype, folder, file.originalname);
  }
}
