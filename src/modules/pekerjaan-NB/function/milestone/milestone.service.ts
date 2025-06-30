import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMilestone } from '../../entities/project-milestone.entity';
import { Pekerjaan } from '../../entities/pekerjaan.entity';
import { 
  CreateMilestoneDto, 
  UpdateMilestoneDto, 
  DeleteMilestoneDto, 
  GetMilestonesDto,
  MilestoneStatus,
  MilestonePriority
} from '../../dto/milestone.dto';

@Injectable()
export class MilestoneService {
  private readonly logger = new Logger(MilestoneService.name);

  constructor(
    @InjectRepository(ProjectMilestone)
    private milestoneRepository: Repository<ProjectMilestone>,
    @InjectRepository(Pekerjaan)
    private pekerjaanRepository: Repository<Pekerjaan>,
  ) {}

  /**
   * Get all milestones for a project with completion status
   */
  async getMilestones(getMilestonesDto: GetMilestonesDto) {
    const { projectId } = getMilestonesDto;

    // Verify project exists
    const project = await this.pekerjaanRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project with id ${projectId} not found`);
    }

    // Get all milestones for the project
    const milestones = await this.milestoneRepository.find({
      where: { pekerjaanId: projectId },
      order: { orderIndex: 'ASC', createdAt: 'ASC' }
    });

    // Calculate overall completion percentage
    const completionPercentage = this.calculateProjectCompletion(milestones);
    
    // Determine overall status
    const status = this.determineProjectStatus(milestones, completionPercentage);

    return {
      projectId,
      status,
      completionPercentage,
      data: milestones,
      message: `Project has ${milestones.length} milestone(s), ${completionPercentage}% completed`
    };
  }

  /**
   * Create a new milestone
   */
  async createMilestone(createMilestoneDto: CreateMilestoneDto) {
    const { projectId, data } = createMilestoneDto;

    // Verify project exists
    const project = await this.pekerjaanRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project with id ${projectId} not found`);
    }

    // Create new milestone
    const milestone = this.milestoneRepository.create({
      pekerjaanId: projectId,
      milestoneName: data.milestoneName,
      milestoneDescription: data.milestoneDescription || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: data.status || MilestoneStatus.PENDING,
      completionPercentage: data.completionPercentage || 0,
      priority: data.priority || MilestonePriority.MEDIUM,
      orderIndex: data.orderIndex || 0,
    });

    const savedMilestone = await this.milestoneRepository.save(milestone);

    // Recalculate project completion
    const allMilestones = await this.milestoneRepository.find({
      where: { pekerjaanId: projectId }
    });
    const completionPercentage = this.calculateProjectCompletion(allMilestones);
    const status = this.determineProjectStatus(allMilestones, completionPercentage);

    this.logger.log(`Created milestone ${savedMilestone.id} for project ${projectId}`);

    return {
      projectId,
      status,
      completionPercentage,
      data: savedMilestone,
      message: 'Milestone created successfully'
    };
  }

  /**
   * Update an existing milestone
   */
  async updateMilestone(updateMilestoneDto: UpdateMilestoneDto) {
    const { projectId, data } = updateMilestoneDto;

    // Verify project exists
    const project = await this.pekerjaanRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project with id ${projectId} not found`);
    }

    // Find existing milestone
    const existingMilestone = await this.milestoneRepository.findOne({
      where: { id: data.id, pekerjaanId: projectId }
    });

    if (!existingMilestone) {
      throw new NotFoundException(`Milestone with id ${data.id} not found in project ${projectId}`);
    }

    // Update milestone fields
    const updateData: Partial<ProjectMilestone> = {};
    
    if (data.milestoneName !== undefined) updateData.milestoneName = data.milestoneName;
    if (data.milestoneDescription !== undefined) updateData.milestoneDescription = data.milestoneDescription;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.completionPercentage !== undefined) updateData.completionPercentage = data.completionPercentage;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.orderIndex !== undefined) updateData.orderIndex = data.orderIndex;

    await this.milestoneRepository.update(data.id, updateData);

    // Get updated milestone
    const updatedMilestone = await this.milestoneRepository.findOne({
      where: { id: data.id }
    });

    // Recalculate project completion
    const allMilestones = await this.milestoneRepository.find({
      where: { pekerjaanId: projectId }
    });
    const completionPercentage = this.calculateProjectCompletion(allMilestones);
    const status = this.determineProjectStatus(allMilestones, completionPercentage);

    this.logger.log(`Updated milestone ${data.id} for project ${projectId}`);

    return {
      projectId,
      status,
      completionPercentage,
      data: updatedMilestone,
      message: 'Milestone updated successfully'
    };
  }

  /**
   * Delete a milestone
   */
  async deleteMilestone(deleteMilestoneDto: DeleteMilestoneDto) {
    const { projectId, milestoneId } = deleteMilestoneDto;

    // Verify project exists
    const project = await this.pekerjaanRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project with id ${projectId} not found`);
    }

    // Find existing milestone
    const existingMilestone = await this.milestoneRepository.findOne({
      where: { id: milestoneId, pekerjaanId: projectId }
    });

    if (!existingMilestone) {
      throw new NotFoundException(`Milestone with id ${milestoneId} not found in project ${projectId}`);
    }

    // Delete milestone
    await this.milestoneRepository.delete(milestoneId);

    // Recalculate project completion
    const remainingMilestones = await this.milestoneRepository.find({
      where: { pekerjaanId: projectId }
    });
    const completionPercentage = this.calculateProjectCompletion(remainingMilestones);
    const status = this.determineProjectStatus(remainingMilestones, completionPercentage);

    this.logger.log(`Deleted milestone ${milestoneId} from project ${projectId}`);

    return {
      projectId,
      status,
      completionPercentage,
      message: 'Milestone deleted successfully'
    };
  }

  /**
   * Get a single milestone by ID
   */
  async findOne(id: string): Promise<ProjectMilestone> {
    const milestone = await this.milestoneRepository.findOne({ where: { id } });
    if (!milestone) {
      throw new NotFoundException(`Milestone with id ${id} not found`);
    }
    return milestone;
  }

  /**
   * Get all milestones for a specific project
   */
  async findByProject(projectId: string): Promise<ProjectMilestone[]> {
    return await this.milestoneRepository.find({
      where: { pekerjaanId: projectId },
      order: { orderIndex: 'ASC', createdAt: 'ASC' }
    });
  }

  /**
   * Calculate overall project completion percentage
   */
  private calculateProjectCompletion(milestones: ProjectMilestone[]): number {
    if (milestones.length === 0) return 0;
    
    const totalCompletion = milestones.reduce((sum, milestone) => sum + milestone.completionPercentage, 0);
    return Math.round(totalCompletion / milestones.length);
  }

  /**
   * Determine project status based on milestones
   */
  private determineProjectStatus(milestones: ProjectMilestone[], completionPercentage: number): string {
    if (milestones.length === 0) return 'pending';
    if (completionPercentage === 100) return 'completed';
    
    const hasInProgress = milestones.some(m => m.status === MilestoneStatus.IN_PROGRESS);
    const hasCompleted = milestones.some(m => m.status === MilestoneStatus.COMPLETED);
    
    if (hasInProgress || hasCompleted) return 'in_progress';
    return 'pending';
  }
} 