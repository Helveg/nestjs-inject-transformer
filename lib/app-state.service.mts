import { OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";

export class AppStateService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private appRunning = false;

  onApplicationBootstrap() {
    this.appRunning = true;
  }

  onApplicationShutdown(signal?: string) {
    this.appRunning = false;
  }

  get isRunning() {
    return this.appRunning;
  }
}
