import { Cell } from '../components/Grid';

export type Difficulty = 'muy_facil' | 'facil' | 'normal' | 'dificil' | 'extremo';

export interface Level {
    id: string;
    difficulty: Difficulty;
    gridSize: number;
    grid: Cell[][];
    solution: Array<{ x: number; y: number }>;
}

export interface FirestoreLevel {
    difficulty: Difficulty;
    gridSize: number;
    grid: (number | null)[][] | { [key: string]: (number | null)[] };
    solution: Array<{ x: number; y: number }>;
    level?: number;
    createdAt?: any;
} 