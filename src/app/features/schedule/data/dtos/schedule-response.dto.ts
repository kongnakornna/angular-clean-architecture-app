export interface ScheduleResponseDto {
  id: string;
  name: string;
  mode: string;
  status: number;
  time_start: string;
  event_type: string;
  event_action: string;
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
  cron_expr?: string;
  manual_trigger: boolean;
  last_run_at?: string;
  next_run_at?: string;
  run_count: number;
  success_count: number;
  failed_count: number;
  device_count: number;
  group_id?: string;
  zone_id?: string;
  area_id?: string;
  created_at: string;
  updated_at: string;
  devices?: ScheduleDeviceResponseDto[];
  settings?: ScheduleSettingResponseDto[];
}

export interface ScheduleDeviceResponseDto {
  id: string;
  schedule_id: string;
  device_id: number;
  device_sn?: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleSettingResponseDto {
  id: string;
  schedule_id: string;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
}

export interface ScheduleHistoryResponseDto {
  id: string;
  schedule_id: string;
  device_id?: number;
  triggered_by: string;
  trigger_source: string;
  status: string;
  event_action: string;
  payload?: string;
  message?: string;
  duration_ms: number;
  retry_count: number;
  executed_at?: string;
  timezone?: string;
  date?: string;
  time?: string;
  created_at: string;
  updated_at: string;
}

export interface ListSchedulePagePayloadDto {
  page?: number;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
  total?: number;
  filter?: unknown;
  data?: ScheduleResponseDto[];
}

export interface ListSchedulePageResponseDto {
  statusCode?: number;
  code?: number;
  message?: string;
  message_th?: string;
  payload?: ListSchedulePagePayloadDto | null;
  data?: { items?: ScheduleResponseDto[]; total?: number } | ScheduleResponseDto[];
  items?: ScheduleResponseDto[];
  total?: number;
}
