export interface MenuItem {
  label: string;
  route: string;
  icon: string;
  permission: string;
  children?: MenuItem[];
}

export const MENU_CONFIG: MenuItem[] = [
  { label: 'nav.dashboard', route: '/dashboard', icon: 'layout-dashboard', permission: 'dashboard.view' },
  { label: 'nav.customers', route: '/customers', icon: 'users', permission: 'customer.view' },
  { label: 'nav.quotations', route: '/quotations', icon: 'file-text', permission: 'quotation.view' },
  { label: 'nav.purchaseOrders', route: '/purchase-orders', icon: 'shopping-cart', permission: 'purchase_order.view' },
  { label: 'nav.products', route: '/products', icon: 'package', permission: 'inventory.view' },
  { label: 'nav.payments', route: '/payments', icon: 'credit-card', permission: 'payment.view' },
  { label: 'nav.documents', route: '/documents', icon: 'folder', permission: 'document.view' },
  { label: 'nav.email', route: '/email/templates', icon: 'mail', permission: 'email.view' },
  { label: 'nav.batchJobs', route: '/batch/jobs', icon: 'layers', permission: 'batch.view' },
  {
    label: 'nav.iot',
    route: '/iot/devices',
    icon: 'cpu',
    permission: 'iot.view',
    children: [
      { label: 'nav.devices', route: '/iot/devices', icon: 'device-desktop', permission: 'iot.view' },
      { label: 'nav.iotSettings', route: '/iot/settings', icon: 'settings', permission: 'iot.view' },
      { label: 'nav.iotReports', route: '/iot/reports', icon: 'chart-bar', permission: 'iot.view' },
      { label: 'nav.mqttDashboard', route: '/mqtt/dashboard', icon: 'chart-bar', permission: 'iot.view' },
      { label: 'nav.mqttFlows', route: '/mqtt/flows', icon: 'radio', permission: 'iot.view' },
    ],
  },
  { label: 'nav.wos', route: '/wos/orders', icon: 'clipboard', permission: 'wos.view' },
  { label: 'nav.jobs', route: '/jobs', icon: 'briefcase', permission: 'job_card.view' },
  { label: 'nav.users', route: '/user/listdata', icon: 'user', permission: 'user.view' },
  { label: 'nav.roles', route: '/user/roles', icon: 'shield', permission: 'role.view' },
  {
    label: 'nav.monitoring',
    route: '/monitoring',
    icon: 'eye',
    permission: 'monitoring.view',
    children: [
      { label: 'nav.smarthome', route: '/monitoring/smarthome', icon: 'home', permission: 'monitoring.view' },
      { label: 'nav.smartcity', route: '/monitoring/smartcity', icon: 'building-community', permission: 'monitoring.view' },
      { label: 'nav.smartmonitor', route: '/monitoring/smartmonitor', icon: 'chart-monitor', permission: 'monitoring.view' },
      { label: 'nav.industry', route: '/monitoring/industry', icon: 'factory', permission: 'monitoring.view' },
      { label: 'nav.smartsolarfarm', route: '/monitoring/smartsolarfarm', icon: 'sun', permission: 'monitoring.view' },
    ],
  },
  {
    label: 'nav.settings',
    route: '/settings',
    icon: 'settings',
    permission: 'settings.view',
    children: [
      { label: 'nav.schedule', route: '/settings/schedule', icon: 'calendar-event', permission: 'settings.view' },
      { label: 'nav.alarm', route: '/settings/alarm', icon: 'bell', permission: 'settings.view' },
      { label: 'nav.influxdb', route: '/settings/influxdb', icon: 'database', permission: 'settings.view' },
      { label: 'nav.devices', route: '/settings/devices', icon: 'device-desktop', permission: 'settings.view' },
      { label: 'nav.locations', route: '/settings/locations', icon: 'map-pin', permission: 'settings.view' },
      { label: 'nav.hardware', route: '/settings/hardware', icon: 'cpu', permission: 'settings.view' },
      { label: 'nav.sensors', route: '/settings/sensors', icon: 'thermometer', permission: 'settings.view' },
      { label: 'nav.nodered', route: '/settings/nodered', icon: 'server', permission: 'settings.view' },
      { label: 'nav.mqtt', route: '/settings/mqtt', icon: 'radio', permission: 'settings.view' },
      { label: 'nav.email', route: '/settings/email', icon: 'mail', permission: 'settings.view' },
      { label: 'nav.line', route: '/settings/line', icon: 'message-circle', permission: 'settings.view' },
      { label: 'nav.sms', route: '/settings/sms', icon: 'phone', permission: 'settings.view' },
      { label: 'nav.hosts', route: '/settings/hosts', icon: 'server', permission: 'settings.view' },
      { label: 'nav.api', route: '/settings/api', icon: 'api', permission: 'settings.view' },
      { label: 'nav.apiHealth', route: '/settings/api-health', icon: 'heart-rate-monitor', permission: 'settings.view' },
      { label: 'nav.tokens', route: '/settings/tokens', icon: 'key', permission: 'settings.view' },
    ],
  },
  {
    label: 'nav.ai',
    route: '/ai-analytics',
    icon: 'robot',
    permission: 'ai_analytics.view',
    children: [
      { label: 'nav.commandCenter', route: '/ai-analytics/command-center', icon: 'robot', permission: 'ai_analytics.view' },
      { label: 'nav.analytics', route: '/ai-analytics/dashboard', icon: 'chart-area', permission: 'ai_analytics.view' },
      { label: 'nav.reports', route: '/ai-analytics/reports', icon: 'file-invoice', permission: 'ai_analytics.view' },
      { label: 'nav.activityLog', route: '/ai-analytics/logs', icon: 'list-details', permission: 'ai_analytics.view' },
      { label: 'nav.workflowAi', route: '/ai-analytics/workflow', icon: 'wave-square', permission: 'ai_analytics.view' },
      { label: 'nav.schedule', route: '/ai-analytics/schedule', icon: 'calendar-event', permission: 'ai_analytics.view' },
      { label: 'nav.alertManagement', route: '/ai-analytics/alerts', icon: 'bell', permission: 'ai_analytics.view' },
      { label: 'nav.dataAnalyst', route: '/ai-analytics/analyst', icon: 'chart-dots-2', permission: 'ai_analytics.view' },
    ],
  },
];
