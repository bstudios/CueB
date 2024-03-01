import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { PublisherGithub } from "@electron-forge/publisher-github";

const config: ForgeConfig = {
  packagerConfig: {
    icon: "icon/icon",
    name: "CueB",
    appCopyright: "2024 Bithell Studios Ltd.",
    appCategoryType: "public.app-category.utilities",
  },
  rebuildConfig: {},
  makers: [
    //new MakerSquirrel({}),
    new MakerZIP({}, ["darwin", "win32"]),
    new MakerDeb({}),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main.ts",
          config: "vite.main.config.ts",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
  ],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: "bstudios",
        name: "cueb",
      },
      prerelease: false,
      draft: false,
      tagPrefix: "v",
    }),
  ],
};

export default config;
