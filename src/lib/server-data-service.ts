import type { DataService } from "@/lib/data-service";
import {
  createTopic,
  updateTopicColor,
  getTopics,
  deleteTopic,
  reorderTopics,
  reorderHabits,
} from "@/app/actions/topics";
import {
  createHabit,
  updateHabit,
  deleteHabit,
  getHabitsWithLogs,
  toggleHabitLog,
} from "@/app/actions/habits";
import { getActivityStats } from "@/app/actions/stats";

export function createServerDataService(): DataService {
  return {
    getTopics,
    createTopic,
    updateTopicColor,
    deleteTopic,
    reorderTopics,
    reorderHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    getHabitsWithLogs,
    toggleHabitLog,
    getActivityStats,
  };
}
