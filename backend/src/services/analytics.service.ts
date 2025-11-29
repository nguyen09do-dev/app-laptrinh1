import { db } from '../lib/db.js';

/**
 * Analytics Service - Cung cấp các metrics và thống kê
 */
export class AnalyticsService {
  /**
   * Lấy tổng quan analytics
   */
  async getOverview() {
    try {
      // Ideas stats
      const ideasStats = await db.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'generated') as generated,
          COUNT(*) FILTER (WHERE status = 'shortlisted') as shortlisted,
          COUNT(*) FILTER (WHERE status = 'approved') as approved,
          COUNT(*) FILTER (WHERE status = 'archived') as archived,
          COUNT(DISTINCT batch_id) FILTER (WHERE batch_id IS NOT NULL) as batches
        FROM ideas
      `);

      // Briefs stats
      const briefsStats = await db.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'draft') as draft,
          COUNT(*) FILTER (WHERE status = 'approved') as approved
        FROM briefs
      `);

      // Contents stats
      const contentsStats = await db.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'draft') as draft,
          COUNT(*) FILTER (WHERE status = 'review') as review,
          COUNT(*) FILTER (WHERE status = 'published') as published,
          COALESCE(SUM(word_count), 0) as total_words,
          COALESCE(AVG(word_count), 0) as avg_words
        FROM contents
      `);

      // Conversion rates
      const totalIdeas = parseInt(ideasStats.rows[0].total) || 0;
      const approvedIdeas = parseInt(ideasStats.rows[0].approved) || 0;
      const totalBriefs = parseInt(briefsStats.rows[0].total) || 0;
      const totalContents = parseInt(contentsStats.rows[0].total) || 0;

      return {
        ideas: {
          total: totalIdeas,
          generated: parseInt(ideasStats.rows[0].generated) || 0,
          shortlisted: parseInt(ideasStats.rows[0].shortlisted) || 0,
          approved: approvedIdeas,
          archived: parseInt(ideasStats.rows[0].archived) || 0,
          batches: parseInt(ideasStats.rows[0].batches) || 0,
        },
        briefs: {
          total: totalBriefs,
          draft: parseInt(briefsStats.rows[0].draft) || 0,
          approved: parseInt(briefsStats.rows[0].approved) || 0,
        },
        contents: {
          total: totalContents,
          draft: parseInt(contentsStats.rows[0].draft) || 0,
          review: parseInt(contentsStats.rows[0].review) || 0,
          published: parseInt(contentsStats.rows[0].published) || 0,
          totalWords: parseInt(contentsStats.rows[0].total_words) || 0,
          avgWords: Math.round(parseFloat(contentsStats.rows[0].avg_words) || 0),
        },
        conversion: {
          ideaToBrief: totalIdeas > 0 ? Math.round((totalBriefs / approvedIdeas) * 100) : 0,
          briefToContent: totalBriefs > 0 ? Math.round((totalContents / totalBriefs) * 100) : 0,
          overall: totalIdeas > 0 ? Math.round((totalContents / totalIdeas) * 100) : 0,
        },
      };
    } catch (error) {
      console.error('Error in getOverview:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê theo thời gian (timeline)
   */
  async getTimelineStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Ideas created over time
    const ideasTimeline = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE status = 'approved') as approved
      FROM ideas
      WHERE created_at >= $1
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [startDate]);

    // Briefs created over time
    const briefsTimeline = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM briefs
      WHERE created_at >= $1
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [startDate]);

    // Contents created over time
    const contentsTimeline = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(word_count) as words
      FROM contents
      WHERE created_at >= $1
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [startDate]);

    return {
      ideas: ideasTimeline.rows,
      briefs: briefsTimeline.rows,
      contents: contentsTimeline.rows,
    };
  }

  /**
   * Lấy thống kê theo persona và industry
   */
  async getPersonaIndustryStats() {
    // Top personas
    const topPersonas = await db.query(`
      SELECT 
        persona,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE status = 'approved') as approved
      FROM ideas
      GROUP BY persona
      ORDER BY count DESC
      LIMIT 10
    `);

    // Top industries
    const topIndustries = await db.query(`
      SELECT 
        industry,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE status = 'approved') as approved
      FROM ideas
      GROUP BY industry
      ORDER BY count DESC
      LIMIT 10
    `);

    return {
      personas: topPersonas.rows,
      industries: topIndustries.rows,
    };
  }

  /**
   * Lấy thống kê về content performance
   */
  async getContentPerformance() {
    // Content by status
    const contentByStatus = await db.query(`
      SELECT 
        status,
        COUNT(*) as count,
        AVG(word_count) as avg_words,
        SUM(word_count) as total_words
      FROM contents
      GROUP BY status
      ORDER BY count DESC
    `);

    // Average word count by month
    const wordCountByMonth = await db.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as count,
        AVG(word_count) as avg_words,
        SUM(word_count) as total_words
      FROM contents
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month ASC
    `);

    return {
      byStatus: contentByStatus.rows,
      byMonth: wordCountByMonth.rows,
    };
  }

  /**
   * Lấy productivity metrics
   */
  async getProductivityMetrics() {
    // Ideas per day (last 30 days)
    const ideasPerDay = await db.query(`
      SELECT 
        COUNT(*) / 30.0 as per_day
      FROM ideas
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    // Briefs per day
    const briefsPerDay = await db.query(`
      SELECT 
        COUNT(*) / 30.0 as per_day
      FROM briefs
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    // Contents per day
    const contentsPerDay = await db.query(`
      SELECT 
        COUNT(*) / 30.0 as per_day
      FROM contents
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    // Average time from idea to brief (in days)
    const avgTimeToBrief = await db.query(`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (b.created_at - i.created_at)) / 86400) as avg_days
      FROM briefs b
      JOIN ideas i ON b.idea_id = i.id
      WHERE i.status = 'approved'
    `);

    // Average time from brief to content (in days)
    const avgTimeToContent = await db.query(`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (c.created_at - b.created_at)) / 86400) as avg_days
      FROM contents c
      JOIN briefs b ON c.brief_id = b.id
    `);

    return {
      ideasPerDay: Math.round(parseFloat(ideasPerDay.rows[0]?.per_day || '0') * 10) / 10,
      briefsPerDay: Math.round(parseFloat(briefsPerDay.rows[0]?.per_day || '0') * 10) / 10,
      contentsPerDay: Math.round(parseFloat(contentsPerDay.rows[0]?.per_day || '0') * 10) / 10,
      avgTimeToBrief: Math.round(parseFloat(avgTimeToBrief.rows[0]?.avg_days || '0') * 10) / 10,
      avgTimeToContent: Math.round(parseFloat(avgTimeToContent.rows[0]?.avg_days || '0') * 10) / 10,
    };
  }
}

export const analyticsService = new AnalyticsService();

