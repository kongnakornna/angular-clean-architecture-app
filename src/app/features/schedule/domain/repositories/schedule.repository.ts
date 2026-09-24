import { Observable } from 'rxjs';
import { Schedule, ScheduleDevice, ScheduleHistory, ScheduleSetting, Group, Zone, Area } from '../entities/schedule.entity';

export interface IScheduleRepository {
  list(params?: { keyword?: string; mode?: string; status?: string; eventType?: string; eventAction?: string; groupId?: string; zoneId?: string; areaId?: string; page?: number; pageSize?: number; start?: string; sort?: string }): Observable<{ data: Schedule[]; total: number }>;
  listAll(params?: { keyword?: string; mode?: string; status?: string; eventType?: string; eventAction?: string }): Observable<Schedule[]>;
  getById(id: string): Observable<Schedule>;
  create(schedule: Partial<Schedule>): Observable<Schedule>;
  update(id: string, schedule: Partial<Schedule>): Observable<Schedule>;
  delete(id: string): Observable<void>;
  setStatus(id: string, status: number): Observable<Schedule>;
  trigger(id: string): Observable<ScheduleHistory>;
  getDevices(scheduleId: string): Observable<ScheduleDevice[]>;
  getDevicePage(params: any): Observable<any>;
  getDeviceList(params: any): Observable<any>;
  mapDevices(scheduleId: string, deviceIds: number[]): Observable<void>;
  getSettings(scheduleId: string): Observable<ScheduleSetting[]>;
  setSetting(scheduleId: string, key: string, value: any): Observable<ScheduleSetting>;
  getHistory(scheduleId: string, params?: { page?: number; pageSize?: number }): Observable<{ data: ScheduleHistory[]; total: number }>;
  getHistoryAll(params?: { page?: number; pageSize?: number; status?: string }): Observable<{ data: ScheduleHistory[]; total: number }>;
  getReport(params?: { from?: string; to?: string; scheduleId?: string }): Observable<any>;
  count(): Observable<number>;
}

export type IScheduleModuleRepository = IScheduleRepository;

export interface IMasterRepository {
  getGroups(params?: { page?: number; pageSize?: number }): Observable<{ data: Group[]; total: number }>;
  getGroup(id: string): Observable<Group>;
  createGroup(group: Partial<Group>): Observable<Group>;
  updateGroup(id: string, group: Partial<Group>): Observable<Group>;
  deleteGroup(id: string): Observable<void>;

  getZones(groupId?: string, params?: { page?: number; pageSize?: number }): Observable<{ data: Zone[]; total: number }>;
  getZone(id: string): Observable<Zone>;
  createZone(zone: Partial<Zone>): Observable<Zone>;
  updateZone(id: string, zone: Partial<Zone>): Observable<Zone>;
  deleteZone(id: string): Observable<void>;

  getAreas(zoneId?: string, params?: { page?: number; pageSize?: number }): Observable<{ data: Area[]; total: number }>;
  getArea(id: string): Observable<Area>;
  createArea(area: Partial<Area>): Observable<Area>;
  updateArea(id: string, area: Partial<Area>): Observable<Area>;
  deleteArea(id: string): Observable<void>;
}
