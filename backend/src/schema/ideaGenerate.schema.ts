import Ajv from 'ajv';

// Khởi tạo AJV validator
const ajv = new Ajv({ allErrors: true });

/**
 * Schema cho một idea item trong mảng response từ AI
 * Chỉ validate: title, description, rationale
 */
const ideaItemSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1 },
    description: { type: 'string', minLength: 1 },
    rationale: { type: 'string', minLength: 1 },
  },
  required: ['title', 'description', 'rationale'],
  additionalProperties: false, // Không cho phép thêm properties khác
};

/**
 * Schema cho mảng ideas từ AI response
 */
const ideasArraySchema = {
  type: 'array',
  items: ideaItemSchema,
  minItems: 1,
  maxItems: 20,
};

// Compile schema thành validator function
const validateIdeasArray = ajv.compile(ideasArraySchema);

/**
 * Interface cho một idea item từ LLM response
 */
export interface IdeaItem {
  title: string;
  description: string;
  rationale: string;
}

/**
 * Validate mảng ideas từ AI response
 * @param data - Dữ liệu cần validate
 * @returns Object chứa kết quả validate
 */
export function validateGeneratedIdeas(data: unknown): {
  valid: boolean;
  data?: IdeaItem[];
  errors?: string;
} {
  const isValid = validateIdeasArray(data);

  if (isValid) {
    return {
      valid: true,
      data: data as IdeaItem[],
    };
  }

  // Format lỗi thành string dễ đọc
  const errorMessages = validateIdeasArray.errors
    ?.map((err) => `${err.instancePath} ${err.message}`)
    .join('; ');

  return {
    valid: false,
    errors: errorMessages || 'Invalid data format',
  };
}

/**
 * Schema cho request body của POST /api/ideas/generate
 * FIX: Thêm count, provider, model, language vào schema
 * để không bị strip bởi additionalProperties: false
 */
export const generateRequestSchema = {
  type: 'object',
  properties: {
    persona: { type: 'string', minLength: 1 },
    industry: { type: 'string', minLength: 1 },
    count: { type: 'number', minimum: 1, maximum: 100 },
    provider: { type: 'string' },
    model: { type: 'string' },
    language: { type: 'string' },
  },
  required: ['persona', 'industry'],
  additionalProperties: false,
};

/**
 * Schema cho request body của PATCH /api/ideas/:id/status
 */
export const updateStatusSchema = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['shortlisted', 'approved', 'archived'],
    },
  },
  required: ['status'],
  additionalProperties: false,
};
