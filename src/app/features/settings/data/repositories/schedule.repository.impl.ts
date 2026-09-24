import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IScheduleRepository } from '../../domain/repositories/schedule.repository';
import { Schedule } from '../../domain/entities/schedule.entity';
import { ScheduleApiDataSource } from '../datasources/schedule.api.datasource';
import { ListSchedulePageResponseDto, ScheduleResponseDto } from '../dtos/schedule-response.dto';

@Injectable({ providedIn: 'root' })
export class ScheduleRepositoryImpl implements IScheduleRepository {
  constructor(private dataSource: ScheduleApiDataSource) {}

  list(params?: { search?: string; page?: number; pageSize?: number; start?: string; status?: string }): Observable<{ data: Schedule[]; total: number }> {
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

  private toFlag(value: unknown): number {
    const parsed = typeof value === 'boolean' ? (value ? 1 : 0) : Number(value ?? 0);
    return Number.isNaN(parsed) ? (value ? 1 : 0) : parsed;
  }

  private mapToDto(schedule: Partial<Schedule>): Partial<ScheduleResponseDto> {
    return {
      schedule_name: schedule.name ?? '',
      start: schedule.startTime ?? '',
      event: this.toFlag(schedule.event),
      sunday: this.toFlag(schedule.sunday),
      monday: this.toFlag(schedule.monday),
      tuesday: this.toFlag(schedule.tuesday),
      wednesday: this.toFlag(schedule.wednesday),
      thursday: this.toFlag(schedule.thursday),
      friday: this.toFlag(schedule.friday),
      saturday: this.toFlag(schedule.saturday),
      status: this.toFlag(schedule.status),
      device_id: schedule.deviceId ?? undefined,
    };
  }

  private parseDate(value: unknown): Date {
    if (!value) return new Date();
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  private mapToEntity(dto: ScheduleResponseDto): Schedule {
    return {
      id: String(dto.schedule_id ?? ''),
      name: dto.schedule_name ?? '',
      startTime: dto.start ?? '',
      event: Number(dto.event),
      sunday: Number(dto.sunday),
      monday: Number(dto.monday),
      tuesday: Number(dto.tuesday),
      wednesday: Number(dto.wednesday),
      thursday: Number(dto.thursday),
      friday: Number(dto.friday),
      saturday: Number(dto.saturday),
      status: Number(dto.status),
      countDevice: Number(dto.countDevice ?? 0),
      deviceId: dto.device_id ?? null,
      deviceName: dto.device_name ?? null,
      createdAt: this.parseDate(dto.createddate),
      updatedAt: this.parseDate(dto.updateddate),
    };
  }
}
