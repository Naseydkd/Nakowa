import { Controller, Post, Headers, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReportsService } from './reports.service';
import { EmailService } from '../email/email.service';

@Controller('reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(
    private reportsService: ReportsService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  @Post('send')
  async sendReport(
    @Headers('x-cron-secret') cronSecret: string,
  ): Promise<{ success: boolean; message: string; timestamp: string }> {
    try {
      // Verify Cron secret
      const expectedSecret = this.configService.get<string>('CRON_SECRET');
      if (cronSecret !== expectedSecret) {
        this.logger.warn('Invalid CRON_SECRET provided');
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      // Generate report
      const reportData = await this.reportsService.generateReport();

      // Get recipients from config
      const recipientsStr = this.configService.get<string>('REPORT_EMAIL_RECIPIENTS', '');
      const recipients = recipientsStr
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      if (recipients.length === 0) {
        this.logger.warn('No email recipients configured');
        return {
          success: false,
          message: 'No email recipients configured',
          timestamp: new Date().toISOString(),
        };
      }

      // Send email
      await this.emailService.sendReport(reportData, recipients);

      this.logger.log(`Report sent to ${recipients.join(', ')}`);
      return {
        success: true,
        message: 'Rapport envoyé avec succès',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to send report', error.stack);
      throw error;
    }
  }

  @Post('test')
  async testReport(): Promise<{
    success: boolean;
    message: string;
    data: any;
    timestamp: string;
  }> {
    try {
      // Generate report
      const reportData = await this.reportsService.generateReport();

      // Get recipients from config
      const recipientsStr = this.configService.get<string>('REPORT_EMAIL_RECIPIENTS', '');
      const recipients = recipientsStr
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      if (recipients.length > 0) {
        // Send email
        await this.emailService.sendReport(reportData, recipients);
        this.logger.log(`Test report sent to ${recipients.join(', ')}`);
      } else {
        this.logger.warn('No email recipients configured for test report');
      }

      return {
        success: true,
        message: recipients.length > 0 ? 'Rapport de test envoyé' : 'Rapport généré (pas de destinataires configurés)',
        data: reportData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to generate test report', error.stack);
      throw error;
    }
  }
}
