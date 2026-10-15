import { z } from 'zod';

export const userRoleEnum = z.enum(['admin', 'manager', 'employee']);
export const departmentTypeEnum = z.enum(['operations', 'finance', 'hr', 'support', 'executive']);
export const workflowStatusEnum = z.enum(['active', 'paused', 'completed', 'failed']);

export const loginSchema = z.object({
  email: z.string().email({ message: 'Valid email address is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export const registerSchema = z.object({
  email: z.string().email({ message: 'Valid corporate email is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  fullName: z.string().min(2, { message: 'Full name is required' }),
  role: userRoleEnum.default('employee'),
  department: departmentTypeEnum.default('operations'),
});

export const documentUploadSchema = z.object({
  title: z.string().min(1, { message: 'Document title is required' }),
  department: departmentTypeEnum,
  fileType: z.string().min(1, { message: 'File type is required' }),
});

export const workflowSchema = z.object({
  name: z.string().min(3, { message: 'Workflow name must be at least 3 characters' }),
  department: departmentTypeEnum,
  triggerEvent: z.string().min(1, { message: 'Trigger event is required' }),
  actions: z.array(z.record(z.any())).min(1, { message: 'At least one action is required' }),
});

export const chatMessageSchema = z.object({
  prompt: z.string().min(1, { message: 'Prompt cannot be empty' }),
  department: departmentTypeEnum.default('operations'),
  documentId: z.string().optional().nullable(),
  mode: z.enum(['standard', 'rag', 'audit']).default('standard'),
});

export const analyzeDocumentSchema = z.object({
  documentText: z.string().min(10, { message: 'Document content is required for analysis' }),
  department: departmentTypeEnum.default('finance'),
  documentType: z.string().default('invoice'),
});
