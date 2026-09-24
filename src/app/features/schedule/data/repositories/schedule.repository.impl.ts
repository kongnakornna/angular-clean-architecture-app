import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IScheduleRepository } from '../../domain/repositories/schedule.repository';
import { Schedule, ScheduleDevice, ScheduleHistory, ScheduleSetting } from '../../domain/entities/schedule.entity';
import { ScheduleApiDataSource } from '../datasources/schedule.api.datasource';
import { ListSchedulePageResponseDto, ScheduleHistoryResponseDto, ScheduleResponseDto, ScheduleSettingResponseDto } from '../dtos/schedule-response.dto';

@Injectable({ providedIn: 'root' })
export class ScheduleModuleRepositoryImpl implements IScheduleRepository {
  constructor(private dataSource: ScheduleApiDataSource) {}

  list(params?: { keyword?: string; mode?: string; status?: string; eventType?: string; eventAction?: string; groupId?: string; zoneId?: string; areaId?: string; page?: number; pageSize?: number; start?: string; sort?: string }): Observable<{ data: Schedule[]; total: number }> {
    return this.dataSource.list(params).pipe(
      map((res) => {
        const body = (res ?? {}) as ListSchedulePageResponseDto & Record<string, any>;
        const items: ScheduleResponseDto[] =
          body.payload?.data ??
          (Array.isArray(body.data) ? body.data : body.data?.items) ??
          body.items ??
          [];
        const total =
          body.payload?.total ??
          body.total ??
          (!Array.isArray(body.data) && Number.isFinite(Number(body.data?.total)) && body.data?.total != null
            ? Number(body.data.total)
            : undefined) ??
          items.length;
        return { data: items.map((dto) => this.mapToEntity(dto)), total };
      })
    );
  }

  listAll(): Observable<Schedule[]> {
    return this.dataSource.listAll().pipe(map((items) => (items ?? []).map((dto) => this.mapToEntity(dto))));
  }

  getById(id: string): Observable<Schedule> {
    return this.dataSource.getById(id).pipe(map((dto) => this.mapToEntity(dto)));
  }

  create(schedule: Partial<Schedule>): Observable<Schedule> {
    return this.dataSource.create(this.mapToDto(schedule)).pipe(map((dto) => this.mapToEntity(dto)));
  }

  update(id: string, schedule: Partial<Schedule>): Observable<Schedule> {
    return this.dataSource.update(id, this.mapToDto(schedule)).pipe(map((dto) => this.mapToEntity(dto)));
  }

  delete(id: string): Observable<void> {
    return this.dataSource.delete(id);
  }

  setStatus(id: string, status: number): Observable<Schedule> {
    return this.dataSource.setStatus(id, status).pipe(map((dto) => this.mapToEntity(dto)));
  }

  trigger(id: string): Observable<ScheduleHistory> {
    return this.dataSource.trigger(id).pipe(map((dto) => this.mapHistoryToEntity(dto)));
  }

  getDevices(scheduleId: string): Observable<ScheduleDevice[]> {
    return this.dataSource.getDevices(scheduleId).pipe(map((items) => (items ?? []).map((dto) => this.mapDeviceToEntity(dto))));
  }

  getDevicePage(params: any): Observable<any> {
    return this.dataSource.getDevicePage(params);
  }

  getDeviceList(params: any): Observable<any> {
    return this.dataSource.getDeviceList(params);
  }

  mapDevices(scheduleId: string, deviceIds: number[]): Observable<void> {
    return this.dataSource.mapDevices(scheduleId, deviceIds);
  }

  getSettings(scheduleId: string): Observable<ScheduleSetting[]> {
    return this.dataSource.getSettings(scheduleId).pipe(map((items) => (items ?? []).map((dto) => this.mapSettingToEntity(dto))));
  }

  setSetting(scheduleId: string, key: string, value: any): Observable<ScheduleSetting> {
    return this.dataSource.setSetting(scheduleId, key, value).pipe(map((dto) => this.mapSettingToEntity(dto)));
  }

  getHistory(scheduleId: string, params?: { page?: number; pageSize?: number }): Observable<{ data: ScheduleHistory[]; total: number }> {
    return this.dataSource.getHistoryBySchedule(scheduleId, params).pipe(
      map((res) => {
        const body = res?.payload || res;
        const items = body?.data || [];
        return { data: items.map((dto: ScheduleHistoryResponseDto) => this.mapHistoryToEntity(dto)), total: body?.total || 0 };
      })
    );
  }

  getHistoryAll(params?: { page?: number; pageSize?: number; status?: string }): Observable<{ data: ScheduleHistory[]; total: number }> {
    return this.dataSource.getHistoryAll(params).pipe(
      map((res) => {
        const body = res?.payload || res;
        const items = body?.data || [];
        return { data: items.map((dto: ScheduleHistoryResponseDto) => this.mapHistoryToEntity(dto)), total: body?.total || 0 };
      })
    );
  }

  getReport(params?: { from?: string; to?: string; scheduleId?: string }): Observable<any> {
    return this.dataSource.getReport(params);
  }

  count(): Observable<number> {
    return this.dataSource.count();
  }

  private toFlag(value: unknown): number {
    const parsed = typeof value === 'boolean' ? (value ? 1 : 0) : Number(value ?? 0);
    return Number.isNaN(parsed) ? (value ? 1 : 0) : parsed;
  }

  private mapToDto(schedule: Partial<Schedule>): Partial<ScheduleResponseDto> {
    return {
      name: schedule.name ?? '',
      mode: schedule.mode ?? 'weekly',
      time_start: schedule.timeStart ?? '',
      event_type: schedule.eventType ?? 'device',
      event_action: schedule.eventAction ?? 'ON',
      event: this.toFlag(schedule.event),
      sunday: this.toFlag(schedule.sunday),
      monday: this.toFlag(schedule.monday),
      tuesday: this.toFlag(schedule.tuesday),
      wednesday: this.toFlag(schedule.wednesday),
      thursday: this.toFlag(schedule.thursday),
      friday: this.toFlag(schedule.friday),
      saturday: this.toFlag(schedule.saturday),
      months: schedule.months ?? [],
      dates: schedule.dates ?? [],
      cron_expr: schedule.cronExpr,
      manual_trigger: !!schedule.manualTrigger,
      status: this.toFlag(schedule.status),
      group_id: schedule.groupId,
      zone_id: schedule.zoneId,
      area_id: schedule.areaId,
    };
  }

  private parseDate(value: unknown): Date {
    if (!value) return new Date();
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  private mapToEntity(dto: ScheduleResponseDto): Schedule {
    return {
      id: String(dto.id ?? ''),
      name: dto.name ?? '',
      mode: (dto.mode as Schedule['mode']) ?? 'weekly',
      status: Number(dto.status),
      timeStart: dto.time_start ?? '',
      eventType: (dto.event_type as Schedule['eventType']) ?? 'device',
      eventAction: (dto.event_action as Schedule['eventAction']) ?? 'ON',
      event: Number(dto.event),
      sunday: Number(dto.sunday),
      monday: Number(dto.monday),
      tuesday: Number(dto.tuesday),
      wednesday: Number(dto.wednesday),
      thursday: Number(dto.thursday),
      friday: Number(dto.friday),
      saturday: Number(dto.saturday),
      months: dto.months ?? [],
      dates: dto.dates ?? [],
      cronExpr: dto.cron_expr,
      manualTrigger: !!dto.manual_trigger,
      lastRunAt: dto.last_run_at ? this.parseDate(dto.last_run_at) : undefined,
      nextRunAt: dto.next_run_at ? this.parseDate(dto.next_run_at) : undefined,
      runCount: Number(dto.run_count ?? 0),
      successCount: Number(dto.success_count ?? 0),
      failedCount: Number(dto.failed_count ?? 0),
      deviceCount: Number(dto.device_count ?? 0),
      groupId: dto.group_id,
      zoneId: dto.zone_id,
      areaId: dto.area_id,
      createdAt: this.parseDate(dto.created_at),
      updatedAt: this.parseDate(dto.updated_at),
      devices: dto.devices?.map((d) => this.mapDeviceToEntity(d)),
      settings: dto.settings?.map((s) => this.mapSettingToEntity(s)),
    };
  }

  private mapDeviceToEntity(dto: any): ScheduleDevice {
    return {
      id: String(dto?.id ?? ''),
      scheduleId: String(dto?.schedule_id ?? ''),
      deviceId: Number(dto?.device_id),
      deviceSn: dto?.device_sn,
      createdAt: this.parseDate(dto?.created_at),
      updatedAt: this.parseDate(dto?.updated_at),
    };
  }

  private mapSettingToEntity(dto: ScheduleSettingResponseDto): ScheduleSetting {
    return {
      id: String(dto?.id ?? ''),
      scheduleId: String(dto?.schedule_id ?? ''),
      key: dto?.key ?? '',
      value: dto?.value,
      createdAt: this.parseDate(dto?.created_at),
      updatedAt: this.parseDate(dto?.updated_at),
    };
  }

  private mapHistoryToEntity(dto: ScheduleHistoryResponseDto): ScheduleHistory {
    return {
      id: String(dto?.id ?? ''),
      scheduleId: String(dto?.schedule_id ?? ''),
      deviceId: dto?.device_id,
      triggeredBy: (dto?.triggered_by as ScheduleHistory['triggeredBy']) ?? 'system',
      triggerSource: (dto?.trigger_source as ScheduleHistory['triggerSource']) ?? 'automatic',
      status: (dto?.status as ScheduleHistory['status']) ?? 'processing',
      eventAction: dto?.event_action ?? '',
      payload: dto?.payload,
      message: dto?.message,
      durationMs: Number(dto?.duration_ms ?? 0),
      retryCount: Number(dto?.retry_count ?? 0),
      executedAt: dto?.executed_at ? this.parseDate(dto.executed_at) : undefined,
      timezone: dto?.timezone,
      date: dto?.date,
      time: dto?.time,
      createdAt: this.parseDate(dto?.created_at),
      updatedAt: this.parseDate(dto?.updated_at),
    };
  }
}
