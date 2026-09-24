export interface CreateScheduleRequestDto {
  name: string;
  mode: string;
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
  status: number;
  group_id?: string;
  zone_id?: string;
  area_id?: string;
}
