export interface ScheduleResponseDto {
  schedule_id: number;
  schedule_name: string;
  start: string;
  event: number;
  sunday: number;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  status: number;
  device_id?: number | null;
  device_name?: string | null;
  createddate: string;
  updateddate: string;
  countRs?: number;
  countDevice?: number;
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
