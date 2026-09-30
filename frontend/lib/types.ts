export type DocumentStatus = 'DRAFT' | 'GENERATED' | 'EDITED' | 'FINAL';

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Party {
  name: string;
  role: string;
  company?: string;
  address?: string;
  email?: string;
  custom_fields?: Record<string, any>;
}

export interface DocumentSection {
  id?: string;
  heading: string;
  content: string;
  order?: number;
  clause_type?: string;
}

export interface StructuredDocumentContent {
  title: string;
  document_type: string;
  jurisdiction?: string;
  parties: Party[];
  sections: DocumentSection[];
  terms?: Record<string, any>;
  warnings?: string[];
  missing_information?: string[];
  disclaimer?: string;
  raw_text?: string;
}

export interface DocumentItem {
  id: string;
  user_id: string;
  title: string;
  document_type: string;
  jurisdiction?: string;
  status: DocumentStatus;
  current_version_id?: string;
  content?: StructuredDocumentContent;
  created_at: string;
  updated_at: string;
  version_count?: number;
}

export interface DocumentListItem {
  id: string;
  title: string;
  document_type: string;
  jurisdiction?: string;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  content: StructuredDocumentContent;
  created_at: string;
  created_by?: string;
}

export interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'currency' | 'date' | 'select' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  default_value?: any;
  options?: string[];
  help_text?: string;
  step?: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  jurisdiction?: string;
  schema: {
    fields: TemplateField[];
  };
  is_active: boolean;
  created_at: string;
}

export interface KeyClauseItem {
  clause_title: string;
  clause_type: string;
  excerpt: string;
  analysis: string;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface RiskItem {
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendation: string;
}

export interface DocumentAnalysisResponse {
  summary: string;
  detected_document_type?: string;
  detected_jurisdiction?: string;
  key_clauses: KeyClauseItem[];
  risks: RiskItem[];
  missing_information: string[];
  questions_to_review: string[];
}

export interface UploadResponse {
  id: string;
  filename: string;
  file_type: string;
  created_at: string;
  extracted_text_preview?: string;
  analysis?: DocumentAnalysisResponse;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
