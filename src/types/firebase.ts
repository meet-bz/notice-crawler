// Firebase 관련 타입 정의

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: string;
}

export interface CrawlConfig {
  id: string;
  userId: string;
  url: string;
  selector: string;
  name: string;
  description?: string;
  schedule?: string; // cron 표현식
  isActive: boolean;
  lastRun?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface CrawlHistory {
  id: string;
  configId: string;
  userId: string;
  url: string;
  selector: string;
  content: string;
  status: 'success' | 'error' | 'no_change';
  errorMessage?: string;
  executionTime: number; // ms
  createdAt: Date;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  email: boolean;
  kakaoTalk: boolean;
  slack?: {
    webhookUrl: string;
    channel: string;
  };
  discord?: {
    webhookUrl: string;
    channel: string;
  };
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 크롤링 작업 상태
export type CrawlJobStatus = 'pending' | 'running' | 'completed' | 'failed';

// Firebase 에뮬레이터 설정
export interface FirebaseEmulatorConfig {
  auth: {
    port: number;
    host: string;
  };
  firestore: {
    port: number;
    host: string;
  };
  ui: {
    enabled: boolean;
    port?: number;
  };
}
