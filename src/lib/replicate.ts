import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const DEMO_MODE = process.env.DEMO_MODE === "true";

// Sample staged room images for demo mode
const DEMO_IMAGES: Record<string, string> = {
  "living-room": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1024&q=90",
  "bedroom": "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1024&q=90",
  "kitchen": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1024&q=90",
  "bathroom": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1024&q=90",
  "office": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1024&q=90",
  "dining": "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1024&q=90",
};

export interface GenerateInput {
  imageUrl: string;
  style: string;
  roomType: string;
  stagingStyle: string;
  stagingRoom: string;
}

/** Helper to call Flux Kontext Pro with a prompt. Retries once on rate limit. */
async function fluxEdit(imageUrl: string, prompt: string): Promise<string> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const output = (await replicate.run("black-forest-labs/flux-kontext-pro", {
        input: {
          prompt,
          input_image: imageUrl,
          aspect_ratio: "match_input_image",
          output_format: "jpg",
          safety_tolerance: 2,
        },
      })) as { url(): string } | string;

      if (output && typeof output === "object" && "url" in output) {
        return (output as { url(): string }).url();
      }
      if (typeof output === "string") {
        return output;
      }
    } catch (err: unknown) {
      const isRateLimit = err instanceof Error && err.message.includes("429");
      if (isRateLimit && attempt === 0) {
        await new Promise((r) => setTimeout(r, 12000));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Flux Kontext Pro returned no output");
}

/**
 * Step 1a: Remove only construction debris. Nothing else changes.
 */
async function cleanRoom(imageUrl: string, roomType: string): Promise<string> {
  return fluxEdit(imageUrl,
    `CRITICAL TASK: Remove ALL construction debris and building materials from this ${roomType}. The room must be COMPLETELY clean — no exceptions. Remove: ladders, scaffolding, buckets, paint cans, paint rollers, brushes, tools, toolboxes, trash bags, garbage, OSB boards, plywood sheets, drywall pieces, cardboard, plastic sheeting, drop cloths, cable spools, wire, tape, foam, insulation scraps, cement bags, sand, gravel, bricks, tiles stacked on floor, pipes lying around, and ANY other construction material or debris on the floor, leaning against walls, or anywhere in the room. The floor must be completely clear. Do NOT touch walls, partitions, columns, beams, windows, doors, pipes mounted on walls, radiators, or room structure — only remove loose objects and mess.`
  );
}

/**
 * Step 1b: Finish raw surfaces — ceiling, floor, doors, outlets.
 */
async function finishRoom(imageUrl: string, roomType: string): Promise<string> {
  return fluxEdit(imageUrl,
    `Finish the raw surfaces in this ${roomType}. NEVER cut into, break, or modify any wall. NEVER create new openings in walls.
1. If ceiling is bare concrete, paint it smooth white.
2. If floor is raw concrete or plywood, add finished flooring (hardwood or tiles).
3. If there is an EXISTING open doorway (a hole in a wall that is clearly a door-sized opening with no door), place a white panel door in it. Do NOT add doors to solid walls — only to openings that already exist.
4. Every visible electrical junction box must get a white cover plate — light switch at wall height, power outlet near floor.
All walls must remain 100% intact — no new holes, no new doors, no modifications to any wall surface.`
  );
}

/**
 * Step 2: Use proplabs/virtual-staging — dedicated virtual staging model.
 * Handles room structure preservation and furniture placement natively.
 */
async function stageRoom(
  cleanImageUrl: string,
  stagingStyle: string,
  stagingRoom: string
): Promise<string> {
  const output = (await replicate.run(
    "proplabs/virtual-staging:635d607efc6e3a6016ef6d655327cd35f3d792e84b8f110688b04498c6e94cfb",
    {
      input: {
        image: cleanImageUrl,
        room: stagingRoom,
        furniture_style: stagingStyle,
        furniture_items: "Default (AI decides)",
        replicate_api_key: process.env.REPLICATE_API_TOKEN,
      },
    }
  )) as { url(): string } | string;

  if (output && typeof output === "object" && "url" in output) {
    return (output as { url(): string }).url();
  }
  if (typeof output === "string") {
    return output;
  }
  throw new Error("No output received from staging model");
}

/**
 * Two-step virtual staging pipeline:
 * 1. Flux Kontext Pro cleans the room (removes construction items, finishes surfaces)
 * 2. proplabs/virtual-staging adds furniture (dedicated staging model)
 * Set DEMO_MODE=true in .env.local to skip API calls.
 */
export async function generateStagedImage({
  imageUrl,
  style,
  roomType,
  stagingStyle,
  stagingRoom,
}: GenerateInput): Promise<string> {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 3000));
    return DEMO_IMAGES[roomType] || DEMO_IMAGES["living-room"];
  }

  // Step 1a: Remove construction debris only
  const cleanedImageUrl = await cleanRoom(imageUrl, roomType);

  // Step 1b: Finish raw surfaces (floor, ceiling, doors, outlets)
  const finishedImageUrl = await finishRoom(cleanedImageUrl, roomType);

  // Step 2: Stage the finished room with furniture
  return stageRoom(finishedImageUrl, stagingStyle, stagingRoom);
}
