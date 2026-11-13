export type Rating = "again" | "hard" | "good" | "easy";

export type CardStatus = "learning" | "review" | "relearning";

export interface CardSchedule {
   status: CardStatus;
   learningStep: number;
   repetitions: number;
   intervalDays: number;
   easeFactor: number;
   dueAt: Date;
   lastReviewedAt: Date | null;
}

export function scheduleReview(
   card: CardSchedule,
   rating: Rating,
   now: Date
): CardSchedule {
    if (card.status === "learning" && rating === "again") {
        return {
          ...card,
          learningStep: 0,
          dueAt: new Date(now.getTime() + 10 * 60 * 1000),
          lastReviewedAt: now,
        };
      }
    if (card.status === "learning" && rating === "hard") {
        return { 
            ... card, 
            dueAt : new Date(now.getTime() + 15 * 60 * 1000),
            lastReviewedAt: now,
        };
      }

    if (card.status === "learning" && rating === "good") {
        if (card.learningStep === 0) {
            return {
                ...card,
                learningStep: 1,
                dueAt: new Date(now.getTime() + 30 * 60 * 1000),
                lastReviewedAt: now,
            };
        }
        if (card.learningStep === 1) {
            return {
                ...card,
                status: "review",
                repetitions: 1,
                intervalDays: 1,
                dueAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
                lastReviewedAt: now,
        };
    }
}
    
      if (card.status === "learning" && rating === "easy") {
        return {
            ... card,
            status: "review",
            learningStep: 0,
            repetitions: 1, 
            intervalDays: 2,
            dueAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
            lastReviewedAt: now,
        };
    }
    
    throw new Error("Not implemented yet");
}