import { GrowthStage, TreeType } from "@/lib/treeStorage";

/** Planned transparent artwork paths, indexed by the persisted tree identity and stage. */
export const TREE_STAGE_IMAGE_PATHS: Record<TreeType, Record<GrowthStage, string>> = {
  moonlight: {
    seed: "/assets/trees/moonlight/seed.png",
    sprout: "/assets/trees/moonlight/sprout.png",
    teen: "/assets/trees/moonlight/teen.png",
    adult: "/assets/trees/moonlight/adult.png",
    mature: "/assets/trees/moonlight/mature.png",
  },
  starlight: {
    seed: "/assets/trees/starlight/starlight-seed.png",
    sprout: "/assets/trees/starlight/starlight-sprout.png",
    teen: "/assets/trees/starlight/starlight-teen.png",
    adult: "/assets/trees/starlight/starlight-adult.png",
    mature: "/assets/trees/starlight/starlight-mature.png",
  },
  lapis: {
    seed: "/assets/trees/lapis/lapis-seed.png",
    sprout: "/assets/trees/lapis/lapis-sprout.png",
    teen: "/assets/trees/lapis/lapis-teen.png",
    adult: "/assets/trees/lapis/lapis-adult.png",
    mature: "/assets/trees/lapis/lapis-mature.png",
  },
  ruby: {
    seed: "/assets/trees/ruby/ruby-seed.png",
    sprout: "/assets/trees/ruby/ruby-sprout.png",
    teen: "/assets/trees/ruby/ruby-teen.png",
    adult: "/assets/trees/ruby/ruby-adult.png",
    mature: "/assets/trees/ruby/ruby-mature.png",
  },
};

/** All five Moonlight stages share this canvas and baseline. */
export const MOONLIGHT_STAGE_IMAGE_DIMENSIONS: Record<GrowthStage, { width: number; height: number }> = {
  seed: { width: 1024, height: 1280 },
  sprout: { width: 1024, height: 1280 },
  teen: { width: 1024, height: 1280 },
  adult: { width: 1024, height: 1280 },
  mature: { width: 1024, height: 1280 },
};

/** Images are currently supplied only for Moonlight; other types use their existing SVG renderers. */
export const TREE_STAGE_IMAGE_ENABLED: Record<TreeType, Record<GrowthStage, boolean>> = {
  moonlight: { seed: true, sprout: true, teen: true, adult: true, mature: true },
  starlight: { seed: false, sprout: false, teen: false, adult: false, mature: false },
  lapis: { seed: false, sprout: false, teen: false, adult: false, mature: false },
  ruby: { seed: false, sprout: false, teen: false, adult: false, mature: false },
};
