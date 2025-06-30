import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pekerjaan } from '../../entities/pekerjaan.entity';
import { ProjectMilestone } from '../../entities/project-milestone.entity';
import { PaymentInstallment } from '../../entities/payment-installment.entity';
import { PaymentStructureUpdateDto, PaymentStructureResponseDto } from '../../dto/payment-structure.dto';

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
    @InjectRepository(PaymentInstallment)
    private paymentInstallmentRepository: Repository<PaymentInstallment>,
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

    // Calculate completion based on milestone setup quality
    let completionPercentage = 0;
    let status = 'pending';

    if (milestones.length === 0) {
      completionPercentage = 0;
      status = 'pending';
    } else {
      // Check if milestones are properly configured
      const completionChecks: boolean[] = [];
      
      // Check 1: At least one milestone exists (25%)
      completionChecks.push(milestones.length > 0);
      
      // Check 2: All milestones have names (25%)
      const allHaveNames = milestones.every(m => m.milestoneName && m.milestoneName.trim() !== '');
      completionChecks.push(allHaveNames);
      
      // Check 3: All milestones have descriptions (25%)
      const allHaveDescriptions = milestones.every(m => m.milestoneDescription && m.milestoneDescription.trim() !== '');
      completionChecks.push(allHaveDescriptions);
      
      // Check 4: All milestones have due dates (25%)
      const allHaveDueDates = milestones.every(m => m.dueDate !== null);
      completionChecks.push(allHaveDueDates);
      
      completionPercentage = Math.round((completionChecks.filter(check => check === true).length / completionChecks.length) * 100);
      status = completionPercentage === 100 ? 'completed' : 'pending';
    }

    return {
      projectId,
      status,
      completionPercentage,
      data: milestones,
      message: `Project has ${milestones.length} milestone(s), milestone setup is ${completionPercentage}% complete`
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

    // Calculate completion based on milestone setup quality
    let completionPercentage = 0;
    if (allMilestones.length > 0) {
      const completionChecks: boolean[] = [];
      
      // Check 1: At least one milestone exists (25%)
      completionChecks.push(allMilestones.length > 0);
      
      // Check 2: All milestones have names (25%)
      const allHaveNames = allMilestones.every(m => m.milestoneName && m.milestoneName.trim() !== '');
      completionChecks.push(allHaveNames);
      
      // Check 3: All milestones have descriptions (25%)
      const allHaveDescriptions = allMilestones.every(m => m.milestoneDescription && m.milestoneDescription.trim() !== '');
      completionChecks.push(allHaveDescriptions);
      
      // Check 4: All milestones have due dates (25%)
      const allHaveDueDates = allMilestones.every(m => m.dueDate !== null);
      completionChecks.push(allHaveDueDates);
      
      completionPercentage = Math.round((completionChecks.filter(check => check === true).length / completionChecks.length) * 100);
    }

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

    // Calculate completion based on milestone setup quality
    let completionPercentage = 0;
    if (allMilestones.length > 0) {
      const completionChecks: boolean[] = [];
      
      // Check 1: At least one milestone exists (25%)
      completionChecks.push(allMilestones.length > 0);
      
      // Check 2: All milestones have names (25%)
      const allHaveNames = allMilestones.every(m => m.milestoneName && m.milestoneName.trim() !== '');
      completionChecks.push(allHaveNames);
      
      // Check 3: All milestones have descriptions (25%)
      const allHaveDescriptions = allMilestones.every(m => m.milestoneDescription && m.milestoneDescription.trim() !== '');
      completionChecks.push(allHaveDescriptions);
      
      // Check 4: All milestones have due dates (25%)
      const allHaveDueDates = allMilestones.every(m => m.dueDate !== null);
      completionChecks.push(allHaveDueDates);
      
      completionPercentage = Math.round((completionChecks.filter(check => check === true).length / completionChecks.length) * 100);
    }

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
  async getPaymentStructure(projectId: string): Promise<PaymentStructureResponseDto> {
    const pekerjaan = await this.pekerjaanRepository.findOne({ 
      where: { id: projectId } 
    });

    if (!pekerjaan) {
      throw new NotFoundException(`Pekerjaan with id ${projectId} not found`);
    }

    // Get all payment installments for this project
    const installments = await this.paymentInstallmentRepository.find({
      where: { pekerjaanId: projectId },
      relations: ['projectMilestone'],
      order: { installmentNumber: 'ASC' }
    });

    // Calculate completion percentage
    let completionPercentage = 0;
    const completionChecks: boolean[] = [];

    // Check basic info completion (25% weight)
    const hasProjectFee = pekerjaan.projectFee !== null && pekerjaan.projectFee > 0;
    const hasCurrency = !!(pekerjaan.currency && pekerjaan.currency.trim() !== '');
    completionChecks.push(hasProjectFee && hasCurrency);

    // Check installments defined (25% weight)
    const hasInstallments = installments.length > 0;
    completionChecks.push(hasInstallments);

    // Check all installments have proper triggers (25% weight)
    const allInstallmentsComplete = hasInstallments && installments.every(inst => 
      inst.triggerType && inst.description && inst.description.trim() !== ''
    );
    completionChecks.push(allInstallmentsComplete);

    // Check bank details (25% weight)
    const hasBankDetails = !!(pekerjaan.bankName && pekerjaan.accountNumber && pekerjaan.accountName);
    completionChecks.push(hasBankDetails);

    completionPercentage = Math.round((completionChecks.filter(check => check === true).length / completionChecks.length) * 100);
    const status = completionPercentage === 100 ? 'completed' : 'pending';

    return {
      projectId,
      status,
      completionPercentage,
      data: {
        basicInfo: {
          projectFee: pekerjaan.projectFee,
          currency: pekerjaan.currency,
          bankName: pekerjaan.bankName,
          accountNumber: pekerjaan.accountNumber,
          accountName: pekerjaan.accountName,
        },
        installments: installments.map(inst => ({
          id: inst.id,
          installmentNumber: inst.installmentNumber,
          amount: Number(inst.amount),
          percentage: Number(inst.percentage),
          triggerType: inst.triggerType as any,
          triggerValue: inst.triggerValue,
          projectMilestoneId: inst.projectMilestoneId,
          description: inst.description,
          status: inst.status as any,
          notes: inst.notes,
          dueDate: inst.dueDate,
        }))
      },
      message: `Payment structure is ${completionPercentage}% complete`
    };
  }

  /**
   * Update payment structure
   */
  async updatePaymentStructure(projectId: string, data: PaymentStructureUpdateDto): Promise<PaymentStructureResponseDto> {
    const pekerjaan = await this.pekerjaanRepository.findOne({ 
      where: { id: projectId } 
    });

    if (!pekerjaan) {
      throw new NotFoundException(`Pekerjaan with id ${projectId} not found`);
    }

    // Update basic info if provided
    if (data.basicInfo) {
      if (data.basicInfo.projectFee !== undefined) {
        if (data.basicInfo.projectFee < 0) {
          throw new BadRequestException('Project fee cannot be negative');
        }
        pekerjaan.projectFee = data.basicInfo.projectFee;
      }
      if (data.basicInfo.currency !== undefined) {
        pekerjaan.currency = data.basicInfo.currency.trim();
      }
      if (data.basicInfo.bankName !== undefined) {
        pekerjaan.bankName = data.basicInfo.bankName?.trim() || null;
      }
      if (data.basicInfo.accountNumber !== undefined) {
        pekerjaan.accountNumber = data.basicInfo.accountNumber?.trim() || null;
      }
      if (data.basicInfo.accountName !== undefined) {
        pekerjaan.accountName = data.basicInfo.accountName?.trim() || null;
      }
      await this.pekerjaanRepository.save(pekerjaan);
    }

    // Update installments if provided
    if (data.installments) {
      // Validate total percentage
      const totalPercentage = data.installments.reduce((sum, inst) => sum + inst.percentage, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new BadRequestException('Total installment percentages must equal 100%');
      }

      // Validate milestone references
      for (const installment of data.installments) {
        if (installment.triggerType === 'milestone' && installment.projectMilestoneId) {
          const milestone = await this.projectMilestoneRepository.findOne({
            where: { id: installment.projectMilestoneId, pekerjaanId: projectId }
          });
          if (!milestone) {
            throw new BadRequestException(`Milestone with id ${installment.projectMilestoneId} not found for this project`);
          }
        }

        // Validate trigger values for different types
        if (installment.triggerType === 'date' && installment.triggerValue) {
          const dueDate = new Date(installment.triggerValue);
          if (isNaN(dueDate.getTime())) {
            throw new BadRequestException('Invalid due date format');
          }
          installment.dueDate = dueDate;
        } else if (installment.triggerType === 'event') {
          // For now, only document_submission is allowed
          if (installment.triggerValue !== 'document_submission') {
            throw new BadRequestException('Only "document_submission" event is currently supported');
          }
        }
      }

      // Process installments (create/update)
      for (const installmentData of data.installments) {
        let installment: PaymentInstallment;

        if (installmentData.id) {
          // Update existing installment
          const existingInstallment = await this.paymentInstallmentRepository.findOne({
            where: { id: installmentData.id, pekerjaanId: projectId }
          });

          if (!existingInstallment) {
            throw new NotFoundException(`Payment installment with id ${installmentData.id} not found for this project`);
          }
          installment = existingInstallment;
        } else {
          // Create new installment
          installment = new PaymentInstallment();
          installment.pekerjaanId = projectId;
        }

        // Update fields
        installment.installmentNumber = installmentData.installmentNumber;
        installment.amount = installmentData.amount;
        installment.percentage = installmentData.percentage;
        installment.triggerType = installmentData.triggerType;
        installment.triggerValue = installmentData.triggerValue || null;
        installment.projectMilestoneId = installmentData.projectMilestoneId || null;
        installment.description = installmentData.description;
        installment.status = installmentData.status || 'pending';
        installment.notes = installmentData.notes || null;
        installment.dueDate = installmentData.dueDate || null;

        await this.paymentInstallmentRepository.save(installment);
      }
    }

    // Return updated payment structure
    return this.getPaymentStructure(projectId);
  }

  /**
   * Delete payment installment
   */
  async deletePaymentInstallment(projectId: string, installmentId: string): Promise<PaymentStructureResponseDto> {
    const pekerjaan = await this.pekerjaanRepository.findOne({ 
      where: { id: projectId } 
    });

    if (!pekerjaan) {
      throw new NotFoundException(`Pekerjaan with id ${projectId} not found`);
    }

    const installment = await this.paymentInstallmentRepository.findOne({
      where: { id: installmentId, pekerjaanId: projectId }
    });

    if (!installment) {
      throw new NotFoundException(`Payment installment with id ${installmentId} not found for this project`);
    }

    await this.paymentInstallmentRepository.remove(installment);

    // Return updated payment structure
    return this.getPaymentStructure(projectId);
  }

  /**
   * Check all completion statuses and update creation_status if everything is complete
   */
  async checkAllCompletions(projectId: string): Promise<any> {
    const pekerjaan = await this.pekerjaanRepository.findOne({ 
      where: { id: projectId } 
    });

    if (!pekerjaan) {
      throw new NotFoundException(`Pekerjaan with id ${projectId} not found`);
    }

    // Get completion status for all sections
    const baseInfo = await this.getBaseInfo(projectId);
    const teamStructure = await this.getTeamStructure(projectId);
    const projectMilestone = await this.getProjectMilestone(projectId);
    const paymentStructure = await this.getPaymentStructure(projectId);

    const sections = [
      { name: 'baseInfo', ...baseInfo },
      { name: 'teamStructure', ...teamStructure },
      { name: 'projectMilestone', ...projectMilestone },
      { name: 'paymentStructure', ...paymentStructure }
    ];

    // Calculate overall completion
    const totalSections = sections.length;
    const completedSections = sections.filter(section => section.status === 'completed').length;
    const overallCompletionPercentage = Math.round((completedSections / totalSections) * 100);
    
    // Check if all sections are completed
    const allCompleted = completedSections === totalSections;

    // Update creation_status if all completed
    let statusUpdated = false;
    if (allCompleted && pekerjaan.creation_status !== 'completed') {
      pekerjaan.creation_status = 'completed';
      await this.pekerjaanRepository.save(pekerjaan);
      statusUpdated = true;
    } else if (!allCompleted && pekerjaan.creation_status === 'completed') {
      // If not all completed but status is completed, revert to in_progress
      pekerjaan.creation_status = 'in_progress';
      await this.pekerjaanRepository.save(pekerjaan);
      statusUpdated = true;
    } else if (completedSections > 0 && pekerjaan.creation_status === 'created') {
      // If some progress made but status is still created, update to in_progress
      pekerjaan.creation_status = 'in_progress';
      await this.pekerjaanRepository.save(pekerjaan);
      statusUpdated = true;
    }

    return {
      projectId,
      overallStatus: allCompleted ? 'completed' : 'in_progress',
      overallCompletionPercentage,
      creation_status: pekerjaan.creation_status,
      statusUpdated,
      sections: sections.map(section => ({
        name: section.name,
        status: section.status,
        completionPercentage: section.completionPercentage,
        message: section.message
      })),
      message: allCompleted 
        ? 'All sections completed! Project creation status updated to completed.'
        : `Project completion: ${completedSections}/${totalSections} sections completed (${overallCompletionPercentage}%)`
    };
  }
} 