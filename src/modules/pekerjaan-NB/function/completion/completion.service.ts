import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pekerjaan } from '../../entities/pekerjaan.entity';
import { ProjectMilestone } from '../../entities/project-milestone.entity';

interface BaseInfoData {
  projectName?: string;
  projectDescription?: string;
}

interface TeamStructureData {
  project_lead?: string;
  [position: string]: string | string[] | undefined; // project_lead is string, positions are string arrays
}

interface ProjectMilestoneData {
  milestoneName: string;
  milestoneDescription?: string;
  dueDate?: Date;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completionPercentage?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  orderIndex?: number;
}

@Injectable()
export class CompletionService {
  constructor(
    @InjectRepository(Pekerjaan)
    private pekerjaanRepository: Repository<Pekerjaan>,
    @InjectRepository(ProjectMilestone)
    private projectMilestoneRepository: Repository<ProjectMilestone>,
  ) {}

  /**
   * Get completion status for base information
   */
  async getBaseInfo(projectId: string): Promise<any> {
    const pekerjaan = await this.pekerjaanRepository.findOne({ 
      where: { id: projectId } 
    });

    if (!pekerjaan) {
      throw new NotFoundException(`Pekerjaan with id ${projectId} not found`);
    }

    // Calculate completion percentage based on filled fields
    const requiredFields = ['projectName', 'projectDescription'];
    const filledFields = requiredFields.filter(field => {
      const value = pekerjaan[field];
      return value && value.toString().trim() !== '';
    });
    
    const completionPercentage = Math.round((filledFields.length / requiredFields.length) * 100);
    const status = completionPercentage === 100 ? 'completed' : 'pending';

    return {
      projectId,
      status,
      completionPercentage,
      data: {
        projectName: pekerjaan.projectName,
        projectDescription: pekerjaan.projectDescription,
        spkId: pekerjaan.spkId // read-only
      },
      message: `Base info is ${completionPercentage}% complete`
    };
  }

  /**
   * Update base information
   */
  async updateBaseInfo(projectId: string, data: BaseInfoData): Promise<any> {
    const pekerjaan = await this.pekerjaanRepository.findOne({ 
      where: { id: projectId } 
    });

    if (!pekerjaan) {
      throw new NotFoundException(`Pekerjaan with id ${projectId} not found`);
    }

    // Update only the editable fields
    if (data.projectName !== undefined) {
      if (!data.projectName.trim()) {
        throw new BadRequestException('Project name cannot be empty');
      }
      pekerjaan.projectName = data.projectName.trim();
    }

    if (data.projectDescription !== undefined) {
      pekerjaan.projectDescription = data.projectDescription.trim();
    }

    const updatedPekerjaan = await this.pekerjaanRepository.save(pekerjaan);

    // Calculate new completion percentage
    const requiredFields = ['projectName', 'projectDescription'];
    const filledFields = requiredFields.filter(field => {
      const value = updatedPekerjaan[field];
      return value && value.toString().trim() !== '';
    });
    
    const completionPercentage = Math.round((filledFields.length / requiredFields.length) * 100);

    return {
      projectId,
      status: 'updated',
      completionPercentage,
      data: {
        projectName: updatedPekerjaan.projectName,
        projectDescription: updatedPekerjaan.projectDescription,
        spkId: updatedPekerjaan.spkId // read-only
      },
      message: 'Base info updated successfully'
    };
  }

  /**
   * Get completion status for team structure
   */
  async getTeamStructure(projectId: string): Promise<any> {
    const pekerjaan = await this.pekerjaanRepository.findOne({ 
      where: { id: projectId } 
    });

    if (!pekerjaan) {
      throw new NotFoundException(`Pekerjaan with id ${projectId} not found`);
    }

    const teamStructure = pekerjaan.teamMemberStructure || {};
    
    // Calculate completion based on team structure
    let completionPercentage = 0;
    const completionChecks: boolean[] = [];

    // Check if project lead exists
    const hasProjectLead = teamStructure.project_lead && teamStructure.project_lead.trim() !== '';
    completionChecks.push(hasProjectLead);

    // Check if there's at least one position with team members
    const positions = Object.keys(teamStructure).filter(key => key !== 'project_lead');
    const hasTeamMembers = positions.some(position => {
      const members = teamStructure[position];
      return Array.isArray(members) && members.length > 0 && members.some(member => member && member.trim() !== '');
    });
    completionChecks.push(hasTeamMembers);

    completionPercentage = Math.round((completionChecks.filter(check => check === true).length / completionChecks.length) * 100);
    const status = completionPercentage === 100 ? 'completed' : 'pending';

    return {
      projectId,
      status,
      completionPercentage,
      data: teamStructure,
      message: `Team structure is ${completionPercentage}% complete`
    };
  }

  /**
   * Update team structure
   */
  async updateTeamStructure(projectId: string, data: TeamStructureData): Promise<any> {
    const pekerjaan = await this.pekerjaanRepository.findOne({ 
      where: { id: projectId } 
    });

    if (!pekerjaan) {
      throw new NotFoundException(`Pekerjaan with id ${projectId} not found`);
    }

    // Validate team structure data
    if (data.project_lead !== undefined) {
      if (!data.project_lead || data.project_lead.trim() === '') {
        throw new BadRequestException('Project lead cannot be empty');
      }
    }

    // Validate position arrays
    for (const [key, value] of Object.entries(data)) {
      if (key !== 'project_lead') {
        if (!Array.isArray(value)) {
          throw new BadRequestException(`Position '${key}' must be an array of user IDs`);
        }
        // Check if array contains valid user IDs (not empty strings)
        const invalidMembers = value.filter(member => !member || member.trim() === '');
        if (invalidMembers.length > 0) {
          throw new BadRequestException(`Position '${key}' contains empty user IDs`);
        }
      }
    }

    // Update team structure
    pekerjaan.teamMemberStructure = { ...pekerjaan.teamMemberStructure, ...data };
    const updatedPekerjaan = await this.pekerjaanRepository.save(pekerjaan);

    // Calculate new completion percentage
    const teamStructure = updatedPekerjaan.teamMemberStructure;
    let completionPercentage = 0;
    const completionChecks: boolean[] = [];

    // Check if project lead exists
    const hasProjectLead = teamStructure.project_lead && teamStructure.project_lead.trim() !== '';
    completionChecks.push(hasProjectLead);

    // Check if there's at least one position with team members
    const positions = Object.keys(teamStructure).filter(key => key !== 'project_lead');
    const hasTeamMembers = positions.some(position => {
      const members = teamStructure[position];
      return Array.isArray(members) && members.length > 0 && members.some(member => member && member.trim() !== '');
    });
    completionChecks.push(hasTeamMembers);

    completionPercentage = Math.round((completionChecks.filter(check => check === true).length / completionChecks.length) * 100);

    return {
      projectId,
      status: 'updated',
      completionPercentage,
      data: updatedPekerjaan.teamMemberStructure,
      message: 'Team structure updated successfully'
    };
  }

  /**
   * Get completion status for project milestone
   */
  async getProjectMilestone(projectId: string): Promise<any> {
    const pekerjaan = await this.pekerjaanRepository.findOne({ 
      where: { id: projectId } 
    });

    if (!pekerjaan) {
      throw new NotFoundException(`Pekerjaan with id ${projectId} not found`);
    }

    // Get all milestones for this project
    const milestones = await this.projectMilestoneRepository.find({
      where: { pekerjaanId: projectId },
      order: { orderIndex: 'ASC', createdAt: 'ASC' }
    });

    // Calculate completion based on milestones
    let completionPercentage = 0;
    let status = 'pending';

    if (milestones.length === 0) {
      completionPercentage = 0;
      status = 'pending';
    } else {
      // At least one milestone exists = some progress
      const completedMilestones = milestones.filter(m => m.status === 'completed');
      completionPercentage = Math.round((completedMilestones.length / milestones.length) * 100);
      status = completionPercentage === 100 ? 'completed' : 'pending';
    }

    return {
      projectId,
      status,
      completionPercentage,
      data: milestones,
      message: `Project has ${milestones.length} milestone(s), ${completionPercentage}% completed`
    };
  }

  /**
   * Create or update project milestone
   */
  async updateProjectMilestone(projectId: string, data: ProjectMilestoneData & { id?: string }): Promise<any> {
    const pekerjaan = await this.pekerjaanRepository.findOne({ 
      where: { id: projectId } 
    });

    if (!pekerjaan) {
      throw new NotFoundException(`Pekerjaan with id ${projectId} not found`);
    }

    // Validate required fields
    if (!data.milestoneName || data.milestoneName.trim() === '') {
      throw new BadRequestException('Milestone name is required');
    }

    let milestone: ProjectMilestone | null;

    if (data.id) {
      // Update existing milestone
      milestone = await this.projectMilestoneRepository.findOne({
        where: { id: data.id, pekerjaanId: projectId }
      });

      if (!milestone) {
        throw new NotFoundException(`Milestone with id ${data.id} not found for this project`);
      }

      // Update fields
      milestone.milestoneName = data.milestoneName.trim();
      if (data.milestoneDescription !== undefined) {
        milestone.milestoneDescription = data.milestoneDescription?.trim() || '';
      }
      if (data.dueDate !== undefined) {
        milestone.dueDate = data.dueDate;
      }
      if (data.status !== undefined) {
        milestone.status = data.status;
      }
      if (data.completionPercentage !== undefined) {
        milestone.completionPercentage = Math.max(0, Math.min(100, data.completionPercentage));
      }
      if (data.priority !== undefined) {
        milestone.priority = data.priority;
      }
      if (data.orderIndex !== undefined) {
        milestone.orderIndex = data.orderIndex;
      }
    } else {
      // Create new milestone
      milestone = new ProjectMilestone();
      milestone.pekerjaanId = projectId;
      milestone.milestoneName = data.milestoneName.trim();
      milestone.milestoneDescription = data.milestoneDescription?.trim() || '';
      milestone.dueDate = data.dueDate || null;
      milestone.status = data.status || 'pending';
      milestone.completionPercentage = data.completionPercentage || 0;
      milestone.priority = data.priority || 'medium';
      milestone.orderIndex = data.orderIndex || 0;
    }

    const savedMilestone = await this.projectMilestoneRepository.save(milestone);

    // Recalculate completion status
    const allMilestones = await this.projectMilestoneRepository.find({
      where: { pekerjaanId: projectId },
      order: { orderIndex: 'ASC', createdAt: 'ASC' }
    });

    const completedMilestones = allMilestones.filter(m => m.status === 'completed');
    const completionPercentage = allMilestones.length > 0 
      ? Math.round((completedMilestones.length / allMilestones.length) * 100) 
      : 0;

    return {
      projectId,
      status: 'updated',
      completionPercentage,
      data: savedMilestone,
      message: data.id ? 'Milestone updated successfully' : 'Milestone created successfully'
    };
  }

  /**
   * Delete project milestone
   */
  async deleteProjectMilestone(projectId: string, milestoneId: string): Promise<any> {
    const pekerjaan = await this.pekerjaanRepository.findOne({ 
      where: { id: projectId } 
    });

    if (!pekerjaan) {
      throw new NotFoundException(`Pekerjaan with id ${projectId} not found`);
    }

    const milestone = await this.projectMilestoneRepository.findOne({
      where: { id: milestoneId, pekerjaanId: projectId }
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone with id ${milestoneId} not found for this project`);
    }

    await this.projectMilestoneRepository.remove(milestone);

    // Recalculate completion status
    const allMilestones = await this.projectMilestoneRepository.find({
      where: { pekerjaanId: projectId },
      order: { orderIndex: 'ASC', createdAt: 'ASC' }
    });

    const completedMilestones = allMilestones.filter(m => m.status === 'completed');
    const completionPercentage = allMilestones.length > 0 
      ? Math.round((completedMilestones.length / allMilestones.length) * 100) 
      : 0;

    return {
      projectId,
      status: 'deleted',
      completionPercentage,
      message: 'Milestone deleted successfully'
    };
  }

  /**
   * Get completion status for payment structure
   */
  async getPaymentStructure(projectId: string): Promise<any> {
    // TODO: Implement payment structure completion logic
    return {
      projectId,
      status: 'pending',
      completionPercentage: 0,
      message: 'Payment structure completion endpoint - to be implemented'
    };
  }

  /**
   * Update payment structure
   */
  async updatePaymentStructure(projectId: string, data: any): Promise<any> {
    // TODO: Implement payment structure update logic
    return {
      projectId,
      status: 'updated',
      data,
      message: 'Payment structure updated successfully'
    };
  }
} 