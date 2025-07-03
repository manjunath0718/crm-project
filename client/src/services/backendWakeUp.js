// Backend wake-up service to prevent sleep on free-tier deployments
import api from './api';

class BackendWakeUpService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  // Start periodic wake-up calls
  start(intervalMinutes = 5) {
    if (this.isRunning) {
      console.log('Backend wake-up service is already running');
      return;
    }

    console.log(`Starting backend wake-up service (every ${intervalMinutes} minutes)`);
    this.isRunning = true;

    // Initial wake-up call
    this.wakeUp();

    // Set up periodic wake-up
    this.intervalId = setInterval(() => {
      this.wakeUp();
    }, intervalMinutes * 60 * 1000); // Convert minutes to milliseconds
  }

  // Stop periodic wake-up calls
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('Backend wake-up service stopped');
    }
  }

  // Make a wake-up call to the backend
  async wakeUp() {
    try {
      await api.get('/');
      console.log('Backend wake-up call successful');
    } catch (error) {
      console.warn('Backend wake-up call failed:', error.message);
    }
  }

  // Check if service is running
  isActive() {
    return this.isRunning;
  }
}

// Create a singleton instance
const backendWakeUpService = new BackendWakeUpService();

export default backendWakeUpService; 