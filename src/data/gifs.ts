
// ─── SHARED GIF POOL FOR ALL PHASES ──────────────────────────────────────────
// Never repeat a GIF — each roast gets a unique one from the pool.
// Success GIFs: 8 options (pick randomly).
// Failure GIFs: 25 options.

export const FAILURE_GIFS = [
  'https://i.gifer.com/19ps.gif',
  'https://i.gifer.com/BZXa.gif',
  'https://i.gifer.com/1kYh.gif',
  'https://i.gifer.com/fysm.gif',
  'https://i.gifer.com/V06s.gif',
  'https://i.gifer.com/YFcY.gif',
  'https://i.gifer.com/MHKq.gif',
  'https://i.gifer.com/2K8.gif',
  'https://i.gifer.com/XOsX.gif',
  'https://i.gifer.com/RiTH.gif',
  'https://i.gifer.com/RLg0.gif',
  'https://i.gifer.com/XxpN.gif',
  'https://i.gifer.com/ArlX.gif',
  'https://i.gifer.com/61F.gif',
  'https://i.gifer.com/5Hnn.gif',
  'https://i.gifer.com/VhkF.gif',
  'https://i.gifer.com/WbOm.gif',
  'https://i.gifer.com/1nQ5.gif',
  'https://i.gifer.com/84.gif',
  'https://i.gifer.com/3Px1.gif',
  'https://i.gifer.com/3RFR.gif',
  'https://i.gifer.com/17Cm.gif',
  'https://i.gifer.com/82FT.gif',
  'https://i.gifer.com/1Vv.gif',
  'https://i.gifer.com/4dh.gif',
  'https://i.gifer.com/SRKH.gif',
  'https://i.gifer.com/6yM.gif',
  'https://i.gifer.com/Xom0.gif',
  'https://i.gifer.com/w5b.gif',
  'https://i.gifer.com/3jBj.gif',
  'https://i.gifer.com/4Gt.gif',
  'https://i.gifer.com/6ROx.gif',
  'https://i.gifer.com/RtVB.gif',
  'https://i.gifer.com/99wh.gif',
  'https://i.gifer.com/3zM0.gif',
  'https://i.gifer.com/UcI.gif',
  'https://i.gifer.com/3VMM.gif',
  'https://i.gifer.com/5oAf.gif',
  'https://i.gifer.com/8ENt.gif',
  'https://i.gifer.com/EaSz.gif'

] as const;

export const SUCCESS_GIFS = [
  'https://i.gifer.com/4j.gif',
  'https://i.gifer.com/Af6V.gif',
  'https://i.gifer.com/1Cp9.gif',
  'https://i.gifer.com/8QJd.gif',
  'https://i.gifer.com/i8.gif',
  'https://i.gifer.com/A1M.gif',
  'https://i.gifer.com/ICU.gif',
  'https://i.gifer.com/2DV.gif',
] as const;

// Track which GIFs have been used (to avoid reuse within a session)
let usedFailureIdx = new Set<number>();
let usedSuccessIdx = new Set<number>();

function getRandomFailureGif(): string {
  // Reset if all used
  if (usedFailureIdx.size >= FAILURE_GIFS.length) {
    usedFailureIdx.clear();
  }
  let idx: number;
  do {
    idx = Math.floor(Math.random() * FAILURE_GIFS.length);
  } while (usedFailureIdx.has(idx));
  usedFailureIdx.add(idx);
  return FAILURE_GIFS[idx];
}

function getRandomSuccessGif(): string {
  // Reset if all used
  if (usedSuccessIdx.size >= SUCCESS_GIFS.length) {
    usedSuccessIdx.clear();
  }
  let idx: number;
  do {
    idx = Math.floor(Math.random() * SUCCESS_GIFS.length);
  } while (usedSuccessIdx.has(idx));
  usedSuccessIdx.add(idx);
  return SUCCESS_GIFS[idx];
}

/** Reset tracking (call when game restarts) */
export function resetGifTracker(): void {
  usedFailureIdx.clear();
  usedSuccessIdx.clear();
}

export { getRandomFailureGif, getRandomSuccessGif };
