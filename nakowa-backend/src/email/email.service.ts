import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface ReportData {
  collectesEnAttente: number;
  collectesEnCours: number;
  collectesRestantes: number;
  totalAbonnements: number;
  montantEncaisse: number;
  resteEncaisser: number;
  generatedAt: Date;
}

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const password = this.configService.get<string>('SMTP_PASSWORD');

    if (!host || !port || !user || !password) {
      this.logger.warn(
        'SMTP configuration incomplete. Email sending will fail.',
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass: password,
      },
    });
  }

  async sendEmail(
    to: string | string[],
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      const result = await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_USER'),
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
      });
      this.logger.log(`Email sent successfully: ${result.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      // Do not throw - let cron continue even if email fails
    }
  }

  async sendReport(
    reportData: ReportData,
    recipients: string[],
  ): Promise<void> {
    const html = this.generateReportHtml(reportData);
    await this.sendEmail(recipients, 'Rapport Nakowa - Collectes', html);
  }

  private generateReportHtml(data: ReportData): string {
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
      }).format(amount);
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .content {
              padding: 30px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #333;
              margin-bottom: 15px;
              border-bottom: 2px solid #667eea;
              padding-bottom: 8px;
            }
            .stat-row {
              display: flex;
              justify-content: space-between;
              padding: 12px;
              background-color: #f9f9f9;
              margin-bottom: 8px;
              border-radius: 4px;
              border-left: 4px solid #667eea;
            }
            .stat-label {
              font-weight: 500;
              color: #555;
            }
            .stat-value {
              font-weight: bold;
              color: #333;
              font-size: 18px;
            }
            .stat-positive {
              color: #28a745;
            }
            .stat-negative {
              color: #dc3545;
            }
            .footer {
              background-color: #f5f5f5;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #999;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 RAPPORT NAKOWA</h1>
            </div>
            <div class="content">
              <div class="section">
                <div class="section-title">🗂️ Collectes</div>
                <div class="stat-row">
                  <span class="stat-label">Collectes en attente</span>
                  <span class="stat-value">${data.collectesEnAttente}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Collectes en cours</span>
                  <span class="stat-value">${data.collectesEnCours}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Collectes restantes</span>
                  <span class="stat-value">${data.collectesRestantes}</span>
                </div>
              </div>

              <div class="section">
                <div class="section-title">💰 Abonnements & Paiements</div>
                <div class="stat-row">
                  <span class="stat-label">Total Abonnements</span>
                  <span class="stat-value">${data.totalAbonnements}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Montant Encaissé</span>
                  <span class="stat-value stat-positive">${formatCurrency(data.montantEncaisse)}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Reste à Encaisser</span>
                  <span class="stat-value stat-negative">${formatCurrency(data.resteEncaisser)}</span>
                </div>
              </div>
            </div>
            <div class="footer">
              <p>Rapport généré le ${data.generatedAt.toLocaleString('fr-FR')}</p>
              <p>© 2024 Nakowa. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
