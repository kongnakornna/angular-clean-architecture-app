import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IScheduleRepository } from '../repositories/schedule.repository';
import { SCHEDULE_MODULE_REPOSITORY } from '../../../../core/di/tokens';
import { ScheduleHistory } from '../entities/schedule.entity';

@Injectable({ providedIn: 'root' })
export class TriggerScheduleUseCase {
  constructor(@Inject(SCHEDULE_MODULE_REPOSITORY) private repo: IScheduleRepository) {}

  execute(id: string): Observable<ScheduleHistory> {
    return this.repo.trigger(id);
  }
}
