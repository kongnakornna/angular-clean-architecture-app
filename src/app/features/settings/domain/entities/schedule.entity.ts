export interface Schedule {
  id: string;
  name: string;
  startTime: string;
  event: number;
  sunday: number;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  status: number;
  deviceId?: number | null;
  deviceName?: string | null;
  countDevice: number;
  createdAt: Date;
  updatedAt: Date;
}
