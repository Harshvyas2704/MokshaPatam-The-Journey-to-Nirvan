import type { Ladder } from '@/types';

/**
 * Raw authoritative ladder map (base -> destination), copied from the source
 * dataset verbatim. Numeric bases climb to numeric tops; a few lead to
 * off-board realms (शून्य लोक, बेहस्त लोक, आत्मपरिभाण लोक). Nothing removed.
 *
 * `ladders` below is the typed, numeric-only view consumed by the board + game;
 * `offboardLadders` preserves the realm-bound entries for later realm support.
 */
export const laddersRaw: Record<string, number | string> = {
  3:259, 7:29,  9:49,  13:35, 18:39,
  22:45, 24:69, 25:53, 32:94, 33:"शून्य लोक",
  38:"बेहस्त लोक", 41:86, 43:66, 47:92, 55:"आत्मपरिभाण लोक",
  59:81, 62:237, 73:109, 74:98, 76:101,
  87:114, 90:188, 97:236, 100:199, 102:265,
  104:236, 105:196, 110:236, 113:237, 116:245,
  118:238, 120:239, 122:201, 124:200, 126:237,
  127:264, 128:283, 130:258, 132:265, 134:252,
  136:274, 138:235, 142:255, 145:271, 148:202,
  149:281, 153:241, 156:247, 157:192, 158:241,
  160:272, 161:241, 162:245, 165:245, 166:261,
  167:236, 168:242, 169:277, 177:202, 179:239,
  181:283, 184:266, 190:268, 195:265, 197:267,
  204:279, 208:224, 210:269, 215:273, 217:282,
  223:270, 225:283, 280:285,
};

export const ladderStarts = new Set(Object.keys(laddersRaw).map(Number));

export const ladderEnds = new Set<number>();
(Object.values(laddersRaw) as (number | string)[]).forEach(v => {
  if (typeof v === 'number') ladderEnds.add(v);
});

export const ladderEndFrom: Record<number, number[]> = {};
Object.entries(laddersRaw).forEach(([s, e]) => {
  if (typeof e === 'number') {
    if (!ladderEndFrom[e]) ladderEndFrom[e] = [];
    ladderEndFrom[e]!.push(Number(s));
  }
});

/**
 * Playable ladders: numeric base -> numeric top. Consumed by the board renderer
 * and the movement/jump logic.
 */
export const ladders: Ladder[] = Object.entries(laddersRaw)
  .map(([fromKey, to]): Ladder | null => {
    const from = Number(fromKey);
    if (Number.isNaN(from) || typeof to !== 'number') {
      return null;
    }
    return { id: `ladder-${from}`, from, to };
  })
  .filter((l): l is Ladder => l !== null);

/**
 * Off-board ladders — destination is a realm string. Preserved so no source
 * data is lost; not yet rendered or played.
 */
export const offboardLadders: { id: string; from: number; to: string }[] =
  Object.entries(laddersRaw)
    .filter(([, to]) => typeof to === 'string')
    .map(([from, to]) => ({
      id: `ladder-off-${from}`,
      from: Number(from),
      to: String(to),
    }));
