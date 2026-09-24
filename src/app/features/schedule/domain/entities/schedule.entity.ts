export interface Schedule {
  id: string;
  name: string;
  mode: 'normal' | 'weekly' | 'full' | 'batch';
  status: number;
  timeStart: string;
  eventType: 'device' | 'email';
  eventAction: 'ON' | 'OFF' | 'start' | 'stop';
  event: number;
  sunday: number;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  months: number[];
  dates: number[];
  cronExpr?: string;
  manualTrigger: boolean;
  lastRunAt?: Date;
  nextRunAt?: Date;
  runCount: number;
  successCount: number;
  failedCount: number;
  deviceCount: number;
  groupId?: string;
  zoneId?: string;
  areaId?: string;
  createdAt: Date;
  updatedAt: Date;
  devices?: ScheduleDevice[];
  settings?: ScheduleSetting[];
}

export interface ScheduleDevice {
  id: string;
  scheduleId: string;
  deviceId: number;
  deviceSn?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleSetting {
  id: string;
  scheduleId: string;
  key: string;
  value: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleHistory {
  id: string;
  scheduleId: string;
  deviceId?: number;
  triggeredBy: 'system' | 'manual';
  triggerSource: 'automatic' | 'manual' | 'cron';
  status: 'processing' | 'success' | 'failed' | 'skipped';
  eventAction: string;
  payload?: string;
  message?: string;
  durationMs: number;
  retryCount: number;
  executedAt?: Date;
  timezone?: string;
  date?: string;
  time?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Zone {
  id: string;
  groupId: string;
  groupName: string;
  name: string;
  description?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Area {
  id: string;
  zoneId: string;
  zoneName: string;
  groupName: string;
  name: string;
  description?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleReport {
  scheduleId: string;
  name: string;
  mode: string;
  totalRuns: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  processing: number;
  successRate: number;
  avgDurationMs: number;
  lastRunAt?: Date;
}
