/**
 * Bulk delete utility functions
 */

const API_BASE = 'http://localhost:3001/api';

export interface BulkDeleteResult {
  success: boolean;
  deletedCount?: number;
  message?: string;
  error?: string;
}

/**
 * Bulk delete ideas
 */
export async function bulkDeleteIdeas(ids: number[]): Promise<BulkDeleteResult> {
  try {
    const response = await fetch(`${API_BASE}/ideas/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error bulk deleting ideas:', error);
    return {
      success: false,
      error: 'Failed to delete ideas',
    };
  }
}

/**
 * Bulk delete briefs
 */
export async function bulkDeleteBriefs(ids: number[]): Promise<BulkDeleteResult> {
  try {
    const response = await fetch(`${API_BASE}/briefs/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error bulk deleting briefs:', error);
    return {
      success: false,
      error: 'Failed to delete briefs',
    };
  }
}

/**
 * Bulk delete contents
 */
export async function bulkDeleteContents(ids: number[]): Promise<BulkDeleteResult> {
  try {
    const response = await fetch(`${API_BASE}/contents/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error bulk deleting contents:', error);
    return {
      success: false,
      error: 'Failed to delete contents',
    };
  }
}
