import { sync } from 'file-exists';

export function findBest(candidates) {
    const filtered = candidates.filter(sync);
    return filtered[0];
}
