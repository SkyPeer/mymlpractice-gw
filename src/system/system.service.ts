import { Injectable } from '@nestjs/common';
import * as process from 'process';
import * as os from 'os';

const round = (value: number) => Math.round(value * 100) / 100;
const toMb = (bytes: number) => round(bytes / 1024 / 1024);

@Injectable()
export class SystemService {
  // Baselines for measuring CPU usage between reads
  private lastCpu = process.cpuUsage();
  private lastHrTime = process.hrtime.bigint();

  // Full snapshot of process resources.
  // `memory` (MB) and `cpu` (%) are the values stored per training epoch,
  // the rest is extra detail for the endpoint.
  get usage() {
    return {
      ...this.getCurrentMemoryUsage,
      ...this.getCurrentCpuUsage,
    };
  }

  // Memory used by the process, MB
  get getCurrentMemoryUsage() {
    const { rss, heapTotal, heapUsed, external, arrayBuffers } =
      process.memoryUsage();

    return {
      memory: toMb(heapUsed),
      rss: toMb(rss),
      heapTotal: toMb(heapTotal),
      heapUsed: toMb(heapUsed),
      external: toMb(external),
      arrayBuffers: toMb(arrayBuffers),
    };
  }

  // CPU consumed since the previous read
  get getCurrentCpuUsage() {
    const cpuDelta = process.cpuUsage(this.lastCpu); // microseconds
    const nowHrTime = process.hrtime.bigint();
    const elapsed = Number(nowHrTime - this.lastHrTime) / 1e6; // ms
    this.lastCpu = process.cpuUsage();
    this.lastHrTime = nowHrTime;

    const user = cpuDelta.user / 1000; // ms
    const system = cpuDelta.system / 1000; // ms
    const cores = os.cpus().length;

    // Percent of wall-clock time spent on CPU, may exceed 100% on multi-core
    const cpu = elapsed > 0 ? round(((user + system) / elapsed) * 100) : 0;

    return {
      cpu,
      cpuPerCore: cores > 0 ? round(cpu / cores) : 0,
      cpuUser: round(user),
      cpuSystem: round(system),
      elapsed: round(elapsed),
      cores,
      loadAverage: os.loadavg().map((value) => round(value)),
      uptime: round(process.uptime()),
    };
  }
}
