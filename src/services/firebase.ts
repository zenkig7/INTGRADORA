import app from '@/lib/firebase';
import { getDatabase, ref, set, serverTimestamp } from 'firebase/database';

const db = getDatabase(app);

/**
 * Sends a command to the robot via Firebase Realtime Database.
 * @param command The name of the command (e.g., 'start', 'stop').
 * @param params Optional parameters for the command.
 */
export async function sendCommand(command: string, params: any = {}) {
  try {
    const commandRef = ref(db, 'robot/commands/latest');
    await set(commandRef, {
      command,
      params,
      timestamp: serverTimestamp(),
    });
    console.log(`Command '${command}' sent successfully.`);
  } catch (error) {
    console.error("Error sending command to Firebase:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

// You can add more functions here to interact with Firebase, 
// for example, to get the robot's status.
