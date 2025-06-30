import { Controller, Post, Body, Get, Param, NotFoundException } from '@nestjs/common';
import { MilestoneService } from './milestone.service';
import { 
  CreateMilestoneDto, 
  UpdateMilestoneDto, 
  DeleteMilestoneDto, 
  GetMilestonesDto 
} from '../../dto/milestone.dto';

@Controller('pekerjaan/milestone')
export class MilestoneController {
  constructor(private readonly milestoneService: MilestoneService) {}

  /**
   * Get all milestones for a project or create/update milestone
   * This endpoint handles both getting milestones and creating/updating based on request body
   */
  @Post()
  async handleMilestone(@Body() body: any) {
    // If only projectId is provided, get milestones
    if (body.projectId && !body.data) {
      const getMilestonesDto: GetMilestonesDto = { projectId: body.projectId };
      return this.milestoneService.getMilestones(getMilestonesDto);
    }

    // If data.id exists, update existing milestone
    if (body.data && body.data.id) {
      const updateMilestoneDto: UpdateMilestoneDto = body;
      return this.milestoneService.updateMilestone(updateMilestoneDto);
    }

    // Otherwise, create new milestone
    if (body.data) {
      const createMilestoneDto: CreateMilestoneDto = body;
      return this.milestoneService.createMilestone(createMilestoneDto);
    }

    throw new Error('Invalid request body format');
  }

  /**
   * Delete a milestone
   */
  @Post('delete')
  async deleteMilestone(@Body() deleteMilestoneDto: DeleteMilestoneDto) {
    return this.milestoneService.deleteMilestone(deleteMilestoneDto);
  }

  /**
   * Get a specific milestone by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.milestoneService.findOne(id);
  }

  /**
   * Get all milestones for a specific project (alternative endpoint)
   */
  @Get('project/:projectId')
  async findByProject(@Param('projectId') projectId: string) {
    const getMilestonesDto: GetMilestonesDto = { projectId };
    return this.milestoneService.getMilestones(getMilestonesDto);
  }

  /**
   * Health check endpoint
   */
  @Get('health')
  healthCheck() {
    return { status: 'ok', service: 'milestone' };
  }
} 