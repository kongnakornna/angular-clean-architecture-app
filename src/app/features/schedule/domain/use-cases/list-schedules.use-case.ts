import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IScheduleRepository } from '../repositories/schedule.repository';
import { SCHEDULE_MODULE_REPOSITORY } from '../../../../core/di/tokens';
import { Schedule } from '../entities/schedule.entity';

@Injectable({ providedIn: 'root' })
export class ListSchedulesUseCase {
  constructor(@Inject(SCHEDULE_MODULE_REPOSITORY) private repo: IScheduleRepository) {}

  execute(params?: { keyword?: string; mode?: string; status?: string; eventType?: string; eventAction?: string; page?: number; pageSize?: number; start?: string; sort?: string }): Observable<{ data: Schedule[]; total: number }> {
    return this.repo.list(params);
  }
}
