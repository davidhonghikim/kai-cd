import * as fs from 'fs';
import * as path from 'path';

interface ServiceBackup {
  id: string;
  serviceId: string;
  timestamp: number;
  data: any;
}

export class ServiceBackupService {
  private static readonly BACKUP_DIR = path.join(process.cwd(), 'backups');

  static async createBackup(serviceId: string, data: any): Promise<ServiceBackup> {
    const backup: ServiceBackup = {
      id: `${serviceId}_${Date.now()}`,
      serviceId,
      timestamp: Date.now(),
      data
    };

    await fs.promises.mkdir(this.BACKUP_DIR, { recursive: true });
    await fs.promises.writeFile(
      path.join(this.BACKUP_DIR, `${backup.id}.json`),
      JSON.stringify(backup, null, 2)
    );

    return backup;
  }

  static async restoreBackup(backupId: string): Promise<any> {
    const backupPath = path.join(this.BACKUP_DIR, `${backupId}.json`);
    const data = await fs.promises.readFile(backupPath, 'utf-8');
    const backup: ServiceBackup = JSON.parse(data);
    return backup.data;
  }

  static async getBackups(serviceId: string): Promise<ServiceBackup[]> {
    await fs.promises.mkdir(this.BACKUP_DIR, { recursive: true });
    const files = await fs.promises.readdir(this.BACKUP_DIR);
    
    const backups = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const data = await fs.promises.readFile(path.join(this.BACKUP_DIR, file), 'utf-8');
          return JSON.parse(data) as ServiceBackup;
        })
    );

    return backups
      .filter(backup => backup.serviceId === serviceId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  static async deleteBackup(backupId: string): Promise<void> {
    const backupPath = path.join(this.BACKUP_DIR, `${backupId}.json`);
    await fs.promises.unlink(backupPath);
  }

  static async exportBackups(): Promise<string> {
    const exportPath = path.join(this.BACKUP_DIR, `export_${Date.now()}.json`);
    const backups = await this.getAllBackups();
    await fs.promises.writeFile(exportPath, JSON.stringify(backups, null, 2));
    return exportPath;
  }

  static async importBackups(file: File): Promise<void> {
    const text = await file.text();
    const backups: ServiceBackup[] = JSON.parse(text);
    
    await Promise.all(
      backups.map(backup =>
        fs.promises.writeFile(
          path.join(this.BACKUP_DIR, `${backup.id}.json`),
          JSON.stringify(backup, null, 2)
        )
      )
    );
  }

  private static async getAllBackups(): Promise<ServiceBackup[]> {
    await fs.promises.mkdir(this.BACKUP_DIR, { recursive: true });
    const files = await fs.promises.readdir(this.BACKUP_DIR);
    
    const backups = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const data = await fs.promises.readFile(path.join(this.BACKUP_DIR, file), 'utf-8');
          return JSON.parse(data) as ServiceBackup;
        })
    );

    return backups.sort((a, b) => b.timestamp - a.timestamp);
  }
} 