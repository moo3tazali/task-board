import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { LabelsService } from './labels.service';
import { SearchDto } from 'src/common/dtos';
import { Label } from './interfaces';
import { Roles } from '../auth/decorators';
import { AppRole } from '@prisma/client';
import { CreateLabelDto, LabelIdDto, UpdateLabelDto } from './dtos';

@Controller('labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  /**
   * Get labels list
   */
  @ApiBearerAuth()
  @Get()
  public async getLabels(
    @Query() { search }: SearchDto,
  ): Promise<Label[]> {
    return this.labelsService.labelList(search);
  }

  /**
   * Create a new label "ADMIN ONLY"
   */
  @ApiBearerAuth()
  @Roles(AppRole.ADMIN)
  @Post()
  public async create(
    @Body() createLabelDto: CreateLabelDto,
  ): Promise<Label> {
    return this.labelsService.create(createLabelDto);
  }

  /**
   * Update label "ADMIN ONLY"
   */
  @ApiBearerAuth()
  @Roles(AppRole.ADMIN)
  @Put(':labelId')
  public async update(
    @Param() { labelId }: LabelIdDto,
    @Body() createLabelDto: UpdateLabelDto,
  ): Promise<Label> {
    return this.labelsService.update(labelId, createLabelDto);
  }

  /**
   * delete label "ADMIN ONLY"
   */
  @ApiBearerAuth()
  @Roles(AppRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':labelId')
  public async delete(@Param() { labelId }: LabelIdDto) {
    await this.labelsService.delete(labelId);
  }
}
