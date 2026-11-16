export type ISODate = string
export type RecordCategory =
  | 'Fitness & Gym' | 'Diet & Nutrition' | 'Body & Weight' | 'Water Intake'
  | 'Sleep & Recovery' | 'Habits & Routines' | 'Meditation & Wellness'
  | 'Reading & Learning' | 'Productivity & Study' | 'Finance Manager'
  | 'Journal & Mood' | 'Goals & Challenges'

export interface BaseRecord {
  id: string
  category: RecordCategory
  title: string
  date: ISODate
  createdAt: string
  updatedAt: string
  notes?: string
  tags: string[]
  archivedAt?: string
  deletedAt?: string
}

export interface WorkoutSet { id: string; reps: number; weightKg: number; completed: boolean; kind: 'warmup' | 'working' | 'dropset' }
export interface WorkoutExercise { id: string; name: string; sets: WorkoutSet[]; restSeconds?: number; notes?: string }
export interface WorkoutRecord extends BaseRecord {
  category: 'Fitness & Gym'
  activity: 'strength' | 'run' | 'walk' | 'cycling' | 'bodyweight' | 'other'
  durationMinutes: number
  distanceKm?: number
  exercises: WorkoutExercise[]
  perceivedEffort?: number
}
export interface FoodRecord extends BaseRecord {
  category: 'Diet & Nutrition'
  foodName: string
  preparation: 'raw' | 'soaked' | 'boiled' | 'steamed' | 'roasted' | 'dry' | 'fried' | 'air-fried' | 'grilled' | 'cooked'
  quantityGrams: number
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  fiberG: number
  sugarG: number
  oilGrams?: number
  source: 'built-in' | 'custom' | 'recipe' | 'barcode'
}
export interface WaterRecord extends BaseRecord { category: 'Water Intake'; volumeMl: number; vessel?: string }
export interface BodyRecord extends BaseRecord { category: 'Body & Weight'; weightKg?: number; bodyFatPercent?: number; measurementsCm?: Record<string, number>; photoIds?: string[] }
export interface SleepRecord extends BaseRecord { category: 'Sleep & Recovery'; bedtime: string; wakeTime: string; durationMinutes: number; quality: 1 | 2 | 3 | 4 | 5; energy: 1 | 2 | 3 | 4 | 5; soreness: 1 | 2 | 3 | 4 | 5 }
export interface FinanceRecord extends BaseRecord { category: 'Finance Manager'; kind: 'income' | 'expense' | 'transfer' | 'debt-payment'; amountMinor: number; currency: 'INR'; accountId: string; categoryId: string; paymentMethod: 'cash' | 'bank' | 'upi' | 'card' | 'other'; recurring?: { interval: 'weekly' | 'monthly' | 'yearly'; nextDate: ISODate } }
export interface JournalRecord extends BaseRecord { category: 'Journal & Mood'; body: string; mood: 'great' | 'good' | 'neutral' | 'low' | 'rough'; gratitude?: string[]; photoIds?: string[]; isPrivate: boolean }
export interface TimedRecord extends BaseRecord { category: 'Meditation & Wellness' | 'Reading & Learning' | 'Productivity & Study' | 'Habits & Routines'; durationMinutes: number; completed: boolean }
export type DisciplineRecord = WorkoutRecord | FoodRecord | WaterRecord | BodyRecord | SleepRecord | FinanceRecord | JournalRecord | TimedRecord

export interface ChallengeRule { id: string; title: string; target?: number; unit?: string; importance: number; required: boolean }
export interface ChallengeDay { date: ISODate; completedRuleIds: string[]; note?: string; evidenceIds?: string[] }
export interface DisciplineChallenge {
  id: string; name: string; durationDays: number; scheduledStart: ISODate; rules: ChallengeRule[]
  days: ChallengeDay[]; status: 'scheduled' | 'active' | 'paused' | 'completed' | 'archived'
  missedDayPolicy: 'continue' | 'reset-streak'; createdAt: string; updatedAt: string
}
export interface UserProfile {
  id: 'primary'; displayName: string; age: number; heightCm: number; weightKg: number; targetWeightKg: number
  language: 'en'; currency: 'INR'; massUnit: 'kg'; distanceUnit: 'km'; volumeUnit: 'ml'; timeFormat: '12h'
  weekStartsOn: 1; waterGoalMl: number; calorieGoal: number; proteinGoalG: number
  studyGoalMinutes: number; readingGoalMinutes: number; meditationGoalMinutes: number; workoutGoalMinutes: number
}
