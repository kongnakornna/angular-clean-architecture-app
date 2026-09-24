import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideTablerIcons } from 'angular-tabler-icons';
import { ProfileComponent } from './profile.component';
import { AUTH_REPOSITORY } from '../../../../../core/di/tokens';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  function setup(getCurrentUserImpl: () => any): Promise<void> {
    return TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideTablerIcons({}),
        {
          provide: AUTH_REPOSITORY,
          useValue: { getCurrentUser: getCurrentUserImpl },
        },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ProfileComponent);
        component = fixture.componentInstance;
      });
  }

  it('should create', async () => {
    await setup(() => of({ id: '1', username: 'testuser' }));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('loads the current user', async () => {
    await setup(() =>
      of({
        id: '1',
        username: 'testuser',
        email: 'test@test.local',
        fullName: 'Test User',
        status: 'ACTIVE',
        role: 'Admin',
        profileImageUrl: null,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      })
    );
    fixture.detectChanges();
    expect(component.loading()).toBeFalse();
    expect(component.user()?.username).toBe('testuser');
    expect(component.error()).toBe('');
  });

  it('renders spinner then content without NG0100 when emission is synchronous (cache hit)', async () => {
    let callCount = 0;
    await setup(() => {
      callCount++;
      return of({ id: '1', username: 'cached-user' });
    });
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(callCount).toBe(1);
    expect(component.loading()).toBeFalse();
    expect(fixture.nativeElement.querySelector('.spinner-border')).toBeNull();
    expect(component.user()?.username).toBe('cached-user');
  });

  it('sets error and stops loading on failure', async () => {
    await setup(() => throwError(() => new Error('boom')));
    fixture.detectChanges();
    expect(component.error()).toBe('boom');
    expect(component.loading()).toBeFalse();
  });
});
