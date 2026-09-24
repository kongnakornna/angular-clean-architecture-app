import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IScheduleRepository } from '../repositories/schedule.repository';
import { SCHEDULE_MODULE_REPOSITORY } from '../../../../core/di/tokens';
import { Schedule } from '../entities/schedule.entity';

@Injectable({ providedIn: 'root' })
export class CreateScheduleUseCase {
  constructor(@Inject(SCHEDULE_MODULE_REPOSITORY) private repo: IScheduleRepository) {}

  execute(schedule: Partial<Schedule>): Observable<Schedule> {
    return this.repo.create(schedule);
  }
}
