import { db } from '../lib/db.js';

/**
 * Settings Service - Quản lý cấu hình hệ thống
 */
export interface SystemSettings {
  ai: {
    defaultProvider: 'openai' | 'gemini';
    defaultModel: string;
    temperature: number;
    maxTokens: number;
  };
  content: {
    defaultLanguage: string;
    defaultWordCount: number;
    defaultFormat: string;
  };
  notifications: {
    emailEnabled: boolean;
    emailAddress: string;
  };
}

const DEFAULT_SETTINGS: SystemSettings = {
  ai: {
    defaultProvider: 'gemini',
    defaultModel: 'gemini-2.5-flash',
    temperature: 0.7,
    maxTokens: 8000,
  },
  content: {
    defaultLanguage: 'vi',
    defaultWordCount: 1000,
    defaultFormat: 'markdown',
  },
  notifications: {
    emailEnabled: false,
    emailAddress: '',
  },
};

export class SettingsService {
  /**
   * Lấy tất cả settings
   */
  async getSettings(): Promise<SystemSettings> {
    try {
      const result = await db.query(`
        SELECT key, value FROM system_settings
      `);
      
      if (result.rows.length === 0) {
        // Nếu chưa có settings, tạo mặc định
        return DEFAULT_SETTINGS;
      }

      // Parse settings từ database
      const settings: any = {};
      result.rows.forEach((row: any) => {
        settings[row.key] = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
      });

      return {
        ai: settings.ai || DEFAULT_SETTINGS.ai,
        content: settings.content || DEFAULT_SETTINGS.content,
        notifications: settings.notifications || DEFAULT_SETTINGS.notifications,
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      // Nếu bảng chưa tồn tại, trả về default
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Cập nhật settings
   */
  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      // Đảm bảo bảng tồn tại
      await this.ensureSettingsTable();

      // Lấy settings hiện tại
      const current = await this.getSettings();

      // Merge với settings mới
      const updated: SystemSettings = {
        ai: { ...current.ai, ...settings.ai },
        content: { ...current.content, ...settings.content },
        notifications: { ...current.notifications, ...settings.notifications },
      };

      // Lưu vào database
      await db.query(`
        INSERT INTO system_settings (key, value)
        VALUES 
          ('ai', $1::jsonb),
          ('content', $2::jsonb),
          ('notifications', $3::jsonb)
        ON CONFLICT (key) 
        DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `, [
        JSON.stringify(updated.ai),
        JSON.stringify(updated.content),
        JSON.stringify(updated.notifications),
      ]);

      return updated;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw new Error('Failed to update settings');
    }
  }

  /**
   * Đảm bảo bảng system_settings tồn tại
   */
  private async ensureSettingsTable() {
    await db.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
  }

  /**
   * Lấy thông tin hệ thống
   */
  async getSystemInfo() {
    // Database info
    const dbInfo = await db.query(`
      SELECT 
        version() as version,
        current_database() as database,
        pg_size_pretty(pg_database_size(current_database())) as size
    `);

    // Table counts
    const tableCounts = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM ideas) as ideas,
        (SELECT COUNT(*) FROM briefs) as briefs,
        (SELECT COUNT(*) FROM contents) as contents
    `);

    return {
      database: {
        version: dbInfo.rows[0]?.version || 'Unknown',
        name: dbInfo.rows[0]?.database || 'Unknown',
        size: dbInfo.rows[0]?.size || 'Unknown',
      },
      tables: {
        ideas: parseInt(tableCounts.rows[0]?.ideas || '0'),
        briefs: parseInt(tableCounts.rows[0]?.briefs || '0'),
        contents: parseInt(tableCounts.rows[0]?.contents || '0'),
      },
      version: '1.0.0',
      backend: 'Fastify + TypeScript',
      frontend: 'Next.js 14 + React 18',
    };
  }
}

export const settingsService = new SettingsService();

