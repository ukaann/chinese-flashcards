// learning - new word going through short term learning
// review - learned word using  sm-2
// relearning - prev learned but forgotten

import { LargeNumberLike } from "crypto";

/*
new:
again - 10 min - restart at step 0
hard - 15 min - stay on current step
good - 30 min - step 0 to 1
good at step 1 - 1 day - to review
easy - 2 days - to review

relearning rules:
if prev learned but forgotten, then:
set repetitions to 0
move to relearning
schedule in 10 min
 use same as new word
 preserve its review history for analytics

 long term review:
 use originnal sm-2 alg
 again - 1 - reset repetiiton, enter relearning
 hard - 3 - difficult, shorten interval
 good - 4 - good - normal sm2
 easy - 5 - easy, longer interval

 EF = max(1.3, EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
 */


 import { describe, test, expect } from "vitest";
 import {
   scheduleReview,
   type CardSchedule,
 } from "./sm2";
 
 const NOW = new Date("2026-11-12T10:00:00Z");
 
 function newCard(): CardSchedule {
   return {
     status: "learning",
     learningStep: 0,
     repetitions: 0,
     intervalDays: 0,
     easeFactor: 2.5,
     dueAt: NOW,
     lastReviewedAt: null,
   };
 }
 
 describe("SM-2 Learning", () => {
   test("Again schedules review in 10 minutes", () => {
     const result = scheduleReview(newCard(), "again", NOW);
 
     expect(result.status).toBe("learning");
     expect(result.learningStep).toBe(0);
     expect(result.dueAt.toISOString()).toBe(
       "2026-11-12T10:10:00.000Z"
     );
   });
 
   test("Hard repeats current step after 15 minutes", () => {
     const result = scheduleReview(newCard(), "hard", NOW);
 
     expect(result.status).toBe("learning");
     expect(result.learningStep).toBe(0);
     expect(result.dueAt.toISOString()).toBe(
       "2026-11-12T10:15:00.000Z"
     );
   });
 
   test("Good advances to the next learning step", () => {
     const result = scheduleReview(newCard(), "good", NOW);
 
     expect(result.status).toBe("learning");
     expect(result.learningStep).toBe(1);
     expect(result.dueAt.toISOString()).toBe(
       "2026-11-12T10:30:00.000Z"
     );
   });
 
   test("Good at step 1 graduates the card", () => {
     const card = {
       ...newCard(),
       learningStep: 1,
     };
 
     const result = scheduleReview(card, "good", NOW);
 
     expect(result.status).toBe("review");
     expect(result.repetitions).toBe(1);
     expect(result.intervalDays).toBe(1);
     expect(result.dueAt.toISOString()).toBe(
       "2026-11-13T10:00:00.000Z"
     );
   });
 
   test("Easy graduates a new card in 2 days", () => {
     const result = scheduleReview(newCard(), "easy", NOW);
 
     expect(result.status).toBe("review");
     expect(result.repetitions).toBe(1);
     expect(result.intervalDays).toBe(2);
     expect(result.dueAt.toISOString()).toBe(
       "2026-11-14T10:00:00.000Z"
     );
   });
 });
 

describe("SM-2 Relearning", () => {
    function matureCard(): CardSchedule {
      return {
        ...newCard(),
        status: "review",
        repetitions: 5,
        intervalDays: 30,
        easeFactor: 2.5,
      };
    }
  
    test("Again resets repetitions and enters relearning", () => {
      const result = scheduleReview(
        matureCard(),
        "again",
        NOW
      );
  
      expect(result.status).toBe("relearning");
      expect(result.repetitions).toBe(0);
      expect(result.learningStep).toBe(0);
      expect(result.dueAt.toISOString()).toBe(
        "2026-11-12T10:10:00.000Z"
      );
    });
  
    test("Good advances a relearning card", () => {
      const card = {
        ...matureCard(),
        status: "relearning" as const,
        learningStep: 0,
        repetitions: 0,
      };
  
      const result = scheduleReview(card, "good", NOW);
  
      expect(result.status).toBe("relearning");
      expect(result.learningStep).toBe(1);
      expect(result.dueAt.toISOString()).toBe(
        "2026-11-12T10:30:00.000Z"
      );
    });
  
    test("Two successful relearning steps graduate card", () => {
      const card = {
        ...matureCard(),
        status: "relearning" as const,
        learningStep: 1,
        repetitions: 0,
      };
  
      const result = scheduleReview(card, "good", NOW);
  
      expect(result.status).toBe("review");
      expect(result.repetitions).toBe(1);
      expect(result.intervalDays).toBe(1);
    });
  });
  

describe("SM-2 Long-Term Reviews", () => {
    const matureCard: CardSchedule = {
      ...newCard(),
      status: "review",
      repetitions: 2,
      intervalDays: 6,
      easeFactor: 2.5,
    };
  
    test.each([
      ["hard", 2.36, 11],
      ["good", 2.5, 15],
      ["easy", 2.6, 18],
    ] as const)(
      "%s updates ease and interval correctly",
      (rating, expectedEase, expectedInterval) => {
        const result = scheduleReview(
          matureCard,
          rating,
          NOW
        );
  
        expect(result.easeFactor).toBeCloseTo(expectedEase);
        expect(result.intervalDays).toBe(expectedInterval);
        expect(result.repetitions).toBe(3);
      }
    );
  });
  