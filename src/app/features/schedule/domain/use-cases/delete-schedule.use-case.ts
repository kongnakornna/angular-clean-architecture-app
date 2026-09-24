import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IScheduleRepository } from '../repositories/schedule.repository';
import { SCHEDULE_MODULE_REPOSITORY } from '../../../../core/di/tokens';

@Injectable({ providedIn: 'root' })
export class DeleteScheduleUseCase {
  constructor(@Inject(SCHEDULE_MODULE_REPOSITORY) private repo: IScheduleRepository) {}

  execute(id: string): Observable<void> {
    return this.repo.delete(id);
  }
}
