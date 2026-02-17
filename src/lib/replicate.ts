import Replicate from "replicate";
import sharp from "sharp";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const DEMO_MODE = process.env.DEMO_MODE === "true";

// Sample staged room images for demo mode
const DEMO_IMAGES: Record<string, string> = {
  "living-room": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1024&q=90",
  "living-kitchen": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1024&q=90",
  "bedroom": "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1024&q=90",
  "kitchen": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1024&q=90",
  "bathroom": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1024&q=90",
  "office": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1024&q=90",
  "dining": "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1024&q=90",
  "hallway": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1024&q=90",
};

export interface GenerateInput {
  imageUrl: string;
  style: string;
  roomType: string;
  customPrompt?: string;
}

/** Extract URL string from Replicate output (handles FileOutput, URL objects, strings). */
function extractUrl(output: unknown): string {
  if (typeof output === "string") return output;
  if (output && typeof output === "object") {
    if ("url" in output && typeof (output as Record<string, unknown>).url === "function") {
      const urlResult = (output as { url(): unknown }).url();
      if (typeof urlResult === "string") return urlResult;
      if (urlResult && typeof urlResult === "object" && "href" in urlResult) {
        return (urlResult as URL).href;
      }
      return String(urlResult);
    }
    if ("href" in output) return (output as URL).href;
  }
  throw new Error("Cannot extract URL from Replicate output");
}

/** Wait helper with jitter */
function wait(ms: number): Promise<void> {
  const jitter = Math.random() * 2000;
  return new Promise((r) => setTimeout(r, ms + jitter));
}

/** Generic Replicate run with rate-limit retry. */
async function replicateRunWithRetry(
  model: `${string}/${string}` | `${string}/${string}:${string}`,
  input: Record<string, unknown>,
  maxRetries = 4
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const output = await replicate.run(model, { input });
      return extractUrl(output);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      const isRateLimit = msg.includes("429") || msg.includes("throttled") || msg.includes("rate");
      if (isRateLimit && attempt < maxRetries - 1) {
        const delay = 15000 * (attempt + 1);
        console.log(`Rate limited, waiting ${delay / 1000}s before retry ${attempt + 1}/${maxRetries}...`);
        await wait(delay);
        continue;
      }
      throw err;
    }
  }
  throw new Error("Replicate returned no output after retries");
}

/** Call Flux Kontext Pro with a prompt. */
async function fluxEdit(imageUrl: string, prompt: string): Promise<string> {
  return replicateRunWithRetry("black-forest-labs/flux-kontext-pro", {
    prompt,
    input_image: imageUrl,
    aspect_ratio: "match_input_image",
    output_format: "jpg",
    safety_tolerance: 2,
  });
}

/**
 * Step 1: Clean room AND finish raw surfaces in a single Flux call.
 */
async function cleanAndFinishRoom(imageUrl: string, roomType: string, customPrompt?: string): Promise<string> {
  const userInstructions = customPrompt ? `\n\nADDITIONAL USER INSTRUCTIONS (follow these too): ${customPrompt}` : "";
  return fluxEdit(imageUrl,
    `ABSOLUTE RULES — NEVER BREAK THESE:
- NEVER remove, move, or modify ANY wall, partition, or column. Every wall must stay exactly where it is.
- NEVER remove or modify stairs, staircases, or steps. They are permanent structure.
- NEVER remove or block any entrance, passage, archway, or opening between rooms.
- NEVER convert a window into a door. Windows are windows — they have glass and are set higher in the wall.
- NEVER add doors to solid walls. Only add doors where there is ALREADY a clear passage/opening you can walk through.
- NEVER change the room layout or geometry in any way.

NOW, only do these surface-level cosmetic changes to this ${roomType}:

1. CEILING: If raw concrete or unpainted — paint it smooth matte white. Do not modify ceiling shape or structure.
2. FLOOR: If raw concrete, screed, or plywood — replace surface with light oak hardwood parquet. Do not change floor level or layout.
3. WALLS: If raw/unpainted — paint smooth white. Do NOT remove or reposition any wall.
4. DEBRIS: Remove only loose construction trash from the floor (tools, buckets, trash bags, cardboard, plastic sheets). Do NOT remove anything that is part of the building structure.
5. LIGHTING: Add one simple modern ceiling light fixture in the center of the ceiling.
6. ELECTRICAL: Cover exposed junction boxes with white plates.

Result: a clean, freshly finished empty ${roomType} with the EXACT same room shape, walls, stairs, windows, and openings as the original photo.${userInstructions}`
  );
}

/**
 * Generate an inpainting mask: black on top (preserve ceiling/walls), white on bottom (fill with furniture).
 * Soft gradient transition to avoid hard edges.
 */
async function generateMask(width: number, height: number): Promise<string> {
  const gradientStart = Math.round(height * 0.25);
  const gradientEnd = Math.round(height * 0.40);

  const raw = Buffer.alloc(width * height);
  for (let y = 0; y < height; y++) {
    let value: number;
    if (y < gradientStart) {
      value = 0; // black — preserve
    } else if (y < gradientEnd) {
      value = Math.round(255 * ((y - gradientStart) / (gradientEnd - gradientStart)));
    } else {
      value = 255; // white — inpaint
    }
    raw.fill(value, y * width, (y + 1) * width);
  }

  const maskBuffer = await sharp(raw, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();

  return `data:image/png;base64,${maskBuffer.toString("base64")}`;
}

/** Fetch image from URL and get its dimensions via sharp. */
async function getImageDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
  const res = await fetch(imageUrl);
  const buffer = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(buffer).metadata();
  return { width: meta.width || 1024, height: meta.height || 768 };
}

/**
 * Step 2: Use FLUX Fill Pro for inpainting furniture into the cleaned room.
 */
async function stageRoom(
  cleanImageUrl: string,
  stylePrompt: string,
  roomPromptHint: string
): Promise<string> {
  // Get actual dimensions of the cleaned image (Flux Kontext may resize)
  const { width, height } = await getImageDimensions(cleanImageUrl);
  const mask = await generateMask(width, height);

  const prompt = `A ${roomPromptHint}. ${stylePrompt}. The room contains ONLY the furniture listed above — nothing else. Each piece of furniture is placed with correct perspective, realistic shadows, and natural lighting matching the room. The walls, windows, doors, floor, and ceiling are unchanged. Professional real estate photography, 4K, photorealistic.`;

  return replicateRunWithRetry("black-forest-labs/flux-fill-pro", {
    image: cleanImageUrl,
    mask,
    prompt,
    guidance: 30,
    steps: 50,
    output_format: "jpg",
  });
}

/**
 * Step 3: Post-staging polish — fix common staging artifacts with Flux.
 * Fixes: paintings leaning on floor, missing ceiling light, open doorways without doors.
 */
async function polishStagedRoom(imageUrl: string, roomType: string): Promise<string> {
  return fluxEdit(imageUrl,
    `CRITICAL: Do NOT change the room structure, walls, floor, stairs, or furniture layout. Only make these small fixes:

1. PAINTINGS/ART: If any painting or framed art is on the floor or leaning against a wall — hang it on the wall at eye level. Artworks must be wall-mounted.

2. CEILING LIGHT: If no ceiling light is visible — add one modern flush-mount or pendant light on the ceiling.

That is all. Do NOT move furniture, do NOT modify walls, do NOT add or remove doors, do NOT change anything else. The room must look identical except for the two fixes above.`
  );
}

/**
 * Three-step virtual staging pipeline:
 * 1. Flux Kontext Pro cleans the room + finishes surfaces
 * 2. FLUX Fill Pro inpaints furniture
 * 3. Flux Kontext Pro polishes staging (fixes paintings, lights, doors)
 * Set DEMO_MODE=true in .env.local to skip API calls.
 */
/**
 * Refine an already-staged image with a user correction prompt.
 * Uses Flux Kontext Pro to apply targeted fixes.
 */
export async function refineImage(imageUrl: string, refinementPrompt: string): Promise<string> {
  return fluxEdit(imageUrl,
    `CRITICAL: Do NOT change the room structure, walls, windows, or floor. Apply ONLY the following correction to this staged room photo:

${refinementPrompt}

Keep everything else exactly as it is. Only apply the specific change requested above.`
  );
}

export async function generateStagedImage({
  imageUrl,
  style,
  roomType,
  customPrompt,
}: GenerateInput): Promise<string> {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 3000));
    return DEMO_IMAGES[roomType] || DEMO_IMAGES["living-room"];
  }

  // Step 1: Clean room + finish raw surfaces (+ custom user prompt if provided)
  const finishedImageUrl = await cleanAndFinishRoom(imageUrl, roomType, customPrompt);

  await wait(3000);

  // Step 2: Stage the finished room with FLUX Fill Pro inpainting
  const stagedImageUrl = await stageRoom(finishedImageUrl, style, roomType);

  await wait(3000);

  // Step 3: Polish — fix paintings, ceiling light, doors
  return polishStagedRoom(stagedImageUrl, roomType);
}
