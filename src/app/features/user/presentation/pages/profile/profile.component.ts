import { Component, ChangeDetectionStrategy, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TablerIconsModule } from 'angular-tabler-icons';

import { GetCurrentUserUseCase } from '../../../../auth/domain/use-cases/get-current-user.use-case';
import { User } from '../../../../auth/domain/entities/user.entity';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DatePipe, TablerIconsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private getCurrentUserUC = inject(GetCurrentUserUseCase);
  private destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly user = signal<User | null>(null);
  readonly defaultAvatar = 'assets/img/avatars/avatar1.png';
  readonly String = String;

  ngOnInit(): void {
    this.loading.set(true);
    this.error.set('');
    this.getCurrentUserUC
      .execute()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.user.set(user);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.message || 'Failed to load profile');
          this.loading.set(false);
        },
      });
  }
}
