const fs = require("fs");
const path = require("path");

function renameFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      renameFiles(filePath);
    }
    // If it's a .mjs file, rename it to .js
    else if (file.endsWith(".mjs")) {
      const newFilePath = filePath.slice(0, -4) + ".js";
      fs.renameSync(filePath, newFilePath);

      // Now, read the file and replace require statements
      const fileContent = fs.readFileSync(newFilePath, "utf-8");
      const updatedContent = fileContent.replace(
        /require\(["']([^"']+)\.mjs["']\)/g,
        (match, p1) => {
          return `require("${p1}.js")`;
        }
      );

      // If the content was modified, write it back to the file
      if (updatedContent !== fileContent) {
        fs.writeFileSync(newFilePath, updatedContent, "utf-8");
      }
    }
  });
}

// Rename `.mjs` files to `.js`, since there's no better way to
// configure TypeScript's emitted extension.
renameFiles(path.join(__dirname, "..", "dist", "cjs"));
