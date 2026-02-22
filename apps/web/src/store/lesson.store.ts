import { create } from 'zustand';

interface AnswerRecord {
  exerciseId: string;
  correct: boolean;
}

interface LessonStore {
  currentLessonId: string | null;
  heartsAtStart: number;
  exerciseIndex: number;
  answers: AnswerRecord[];
  setLesson: (id: string, hearts: number) => void;
  recordAnswer: (exerciseId: string, correct: boolean) => void;
  nextExercise: () => void;
  reset: () => void;
}

export const useLessonStore = create<LessonStore>((set) => ({
  currentLessonId: null,
  heartsAtStart: 5,
  exerciseIndex: 0,
  answers: [],

  setLesson: (id, hearts) =>
    set({ currentLessonId: id, heartsAtStart: hearts, exerciseIndex: 0, answers: [] }),

  recordAnswer: (exerciseId, correct) =>
    set((state) => ({
      answers: [...state.answers, { exerciseId, correct }],
    })),

  nextExercise: () =>
    set((state) => ({ exerciseIndex: state.exerciseIndex + 1 })),

  reset: () =>
    set({ currentLessonId: null, heartsAtStart: 5, exerciseIndex: 0, answers: [] }),
}));
