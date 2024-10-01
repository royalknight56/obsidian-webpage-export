import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import fs from "fs";

const banner =
`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const prod = (process.argv[2] === 'production');

// Define a custom plugin for post-processing with regex replacements
const regexReplacementPlugin = {
  name: 'regex-replacement',
  setup(build) {
    build.onEnd((result) => {
      console.log("Plugin onEnd hook called");
      if (result.outputFiles) {
        result.outputFiles.forEach(file => {
          console.log(`Processing file: ${file.path}`);
          
          // Access the raw text output
          let contents = file.text;
          
          console.log("Original content length:", contents.length);

          // Apply regex replacements
          contents = contents
            // Remove info_ variables
            .replace(/this\.info_[\S\s]+?;/gm, "")
            // Remove require statements
            .replace(/var .+?__require\(.+?\);/gm, "");

          console.log("Content length after replacements:", contents.length);

          // Add banner
          contents = banner + '\n' + contents;

          // Update the file contents
          file.contents = new TextEncoder().encode(contents);

          // Write the file to disk manually
          fs.writeFileSync(file.path, contents);
          console.log(`File written to: ${file.path}`);
        });
      } else {
        console.log("No output files found");
      }
    });
  }
};

esbuild.build({
  entryPoints: ["src/frontend/main/index.txt.ts"],
  external: ['moment', "src/plugin/*"],
  bundle: true,
  minify: false,
  treeShaking: true,
  platform: 'browser',
  outdir: "src/frontend/dist",
  tsconfig: "tsconfig.frontend.json",
  watch: !prod,
  plugins: [regexReplacementPlugin],
  write: false, // Keep this false to allow our plugin to handle file writing
}).then(() => {
  console.log("Build completed");
}).catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});

await esbuild.build({
	loader: {
		'.txt.js': 'text',
		'.txt.css': 'text',
		'.wasm': 'binary',
		'.png': 'binary',
	},
	banner: {
		js: banner,
	},
	entryPoints: ['src/plugin/main.ts'],
	bundle: true,
	tsconfig: 'tsconfig.json',
	external: [
		'obsidian',
		'electron',
		'@codemirror/autocomplete',
		'@codemirror/collab',
		'@codemirror/commands',
		'@codemirror/language',
		'@codemirror/lint',
		'@codemirror/search',
		'@codemirror/state',
		'@codemirror/view',
		'@lezer/common',
		'@lezer/highlight',
		'@lezer/lr',
		'node:buffer',
		'node:stream',
		...builtins],
	format: 'cjs',
	watch: !prod,
	target: 'es2018',
	logLevel: "info",
	sourcemap: prod ? false : 'inline',
	treeShaking: true,
	outfile: 'main.js'
}).catch(() => process.exit(1));


