export interface SystemMetrics {
  cpu: number;
  memory: number;
  storage: number;
  network: {
    uptime: number;
    latency: number;
    bandwidth: string;
  };
  security: {
    firewall: 'active' | 'inactive';
    ssl: 'enabled' | 'disabled';
    lastScan: string;
  };
}

export class SystemMonitor {
  private static instance: SystemMonitor;
  private metrics: SystemMetrics;
  private updateInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.metrics = {
      cpu: 23,
      memory: 67,
      storage: 45,
      network: {
        uptime: 99.9,
        latency: 12,
        bandwidth: '1.2 GB/s'
      },
      security: {
        firewall: 'active',
        ssl: 'enabled',
        lastScan: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      }
    };
  }

  public static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  public startMonitoring(): void {
    if (this.updateInterval) return;

    this.updateInterval = setInterval(() => {
      this.updateMetrics();
    }, 30000); // Update every 30 seconds
  }

  public stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private updateMetrics(): void {
    // Simulate realistic metric fluctuations
    this.metrics.cpu = Math.max(10, Math.min(90, this.metrics.cpu + (Math.random() - 0.5) * 10));
    this.metrics.memory = Math.max(30, Math.min(95, this.metrics.memory + (Math.random() - 0.5) * 5));
    this.metrics.storage = Math.max(20, Math.min(80, this.metrics.storage + (Math.random() - 0.5) * 2));
    
    // Simulate network fluctuations
    this.metrics.network.latency = Math.max(5, Math.min(50, this.metrics.network.latency + (Math.random() - 0.5) * 5));
    this.metrics.network.uptime = Math.max(95, Math.min(100, this.metrics.network.uptime + (Math.random() - 0.5) * 0.1));
  }

  public getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  public getCPUUsage(): number {
    return this.metrics.cpu;
  }

  public getMemoryUsage(): number {
    return this.metrics.memory;
  }

  public getStorageUsage(): number {
    return this.metrics.storage;
  }

  public getNetworkStatus() {
    return { ...this.metrics.network };
  }

  public getSecurityStatus() {
    return { ...this.metrics.security };
  }

  public runSecurityScan(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.metrics.security.lastScan = new Date().toISOString();
        resolve(true);
      }, 2000);
    });
  }

  public optimizeSystem(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.metrics.cpu = Math.max(10, this.metrics.cpu * 0.8);
        this.metrics.memory = Math.max(30, this.metrics.memory * 0.9);
        resolve(true);
      }, 3000);
    });
  }
}

export const systemMonitor = SystemMonitor.getInstance();