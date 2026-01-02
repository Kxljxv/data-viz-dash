import type { Tour } from '$lib/types/tour';

// Mock storage key
const STORAGE_KEY = 'aea_tours_v1';

class TourStore {
    tours = $state<Tour[]>([]);

    constructor() {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    this.tours = JSON.parse(stored);
                } catch (e) {
                    console.error('Failed to parse tours', e);
                }
            }
        }
    }

    save() {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tours));
        }
    }

    getTour(projectId: string): Tour | undefined {
        return this.tours.find(t => t.projectId === projectId);
    }

    saveTour(tour: Tour) {
        const index = this.tours.findIndex(t => t.id === tour.id);
        if (index >= 0) {
            this.tours[index] = tour;
        } else {
            this.tours.push(tour);
        }
        this.save();
    }

    createTour(projectId: string, name: string): Tour {
        const newTour: Tour = {
            id: crypto.randomUUID(),
            projectId,
            name,
            slides: []
        };
        this.saveTour(newTour);
        return newTour;
    }

    deleteTour(tourId: string) {
        this.tours = this.tours.filter(t => t.id !== tourId);
        this.save();
    }
}

export const tourStore = new TourStore();
