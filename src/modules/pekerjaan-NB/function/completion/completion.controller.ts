import { Controller, Post, Body, Delete } from '@nestjs/common';
import { CompletionService } from './completion.service';

interface BaseInfoRequest {
  projectId: string;
  data?: {
    projectName?: string;
    projectDescription?: string;
  };
}

interface TeamStructureRequest {
  projectId: string;
  data?: {
    project_lead?: string;
    [position: string]: string | string[] | undefined;
  };
}

interface ProjectMilestoneRequest {
  projectId: string;
  data?: {
    id?: string;
    milestoneName?: string;
    milestoneDescription?: string;
    dueDate?: Date;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    completionPercentage?: number;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    orderIndex?: number;
  };
}

interface ProjectMilestoneDeleteRequest {
  projectId: string;
  milestoneId: string;
}

interface PaymentStructureRequest {
  projectId: string;
  data?: import('../../dto/payment-structure.dto').PaymentStructureUpdateDto; // Optional data for updates
}

interface PaymentInstallmentDeleteRequest {
  projectId: string;
  installmentId: string;
}

interface CheckAllCompletionsRequest {
  projectId: string;
}

@Controller('pekerjaan/completion')
export class CompletionController {
  constructor(private readonly completionService: CompletionService) {}

  @Post('base-info')
  handleBaseInfo(@Body() request: BaseInfoRequest) {
    if (request.data) {
      // Update operation
      return this.completionService.updateBaseInfo(request.projectId, request.data);
    } else {
      // Get operation
      return this.completionService.getBaseInfo(request.projectId);
    }
  }

  @Post('team-structure')
  handleTeamStructure(@Body() request: TeamStructureRequest) {
    if (request.data) {
      // Update operation
      return this.completionService.updateTeamStructure(request.projectId, request.data);
    } else {
      // Get operation
      return this.completionService.getTeamStructure(request.projectId);
    }
  }

  @Post('project-milestone')
  handleProjectMilestone(@Body() request: ProjectMilestoneRequest) {
    if (request.data) {
      // Update operation
      return this.completionService.updateProjectMilestone(request.projectId, request.data as any);
    } else {
      // Get operation
      return this.completionService.getProjectMilestone(request.projectId);
    }
  }

  @Post('project-milestone/delete')
  deleteProjectMilestone(@Body() request: ProjectMilestoneDeleteRequest) {
    return this.completionService.deleteProjectMilestone(request.projectId, request.milestoneId);
  }

  @Post('payment-structure')
  handlePaymentStructure(@Body() request: PaymentStructureRequest) {
    if (request.data) {
      // Update operation
      return this.completionService.updatePaymentStructure(request.projectId, request.data);
    } else {
      // Get operation
      return this.completionService.getPaymentStructure(request.projectId);
    }
  }

  @Post('payment-structure/delete')
  deletePaymentInstallment(@Body() request: PaymentInstallmentDeleteRequest) {
    return this.completionService.deletePaymentInstallment(request.projectId, request.installmentId);
  }

  @Post('check-all')
  checkAllCompletions(@Body() request: CheckAllCompletionsRequest) {
    return this.completionService.checkAllCompletions(request.projectId);
  }
} 