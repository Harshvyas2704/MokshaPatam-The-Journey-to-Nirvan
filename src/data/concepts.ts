/**
 * Spiritual concepts — the real Mokshapat dataset goes here.
 *
 * Concepts attach teaching content to a cell and are surfaced in the event modal
 * when the soul lands on that cell. Each must conform to `Concept`:
 *
 *   {
 *     id: string,            // unique id
 *     cellId: number,        // the cell this concept is attached to
 *     title: string,         // concept name
 *     sanskrit?: string,     // optional Devanagari term
 *     translation?: string,  // optional meaning
 *     description?: string,  // optional longer teaching text
 *   }
 *
 * Example (delete when adding real data):
 *   { id: 'concept-1', cellId: 42, title: 'Example Concept',
 *     sanskrit: 'उदाहरण', translation: 'example',
 *     description: 'Longer teaching text.' },
 */
import type { Concept } from '@/types';

export const concepts: Concept[] = [];
