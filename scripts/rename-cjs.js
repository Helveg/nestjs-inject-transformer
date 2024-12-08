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
    // If it's a .js file, rename it to .mjs
    else if (file.endsWith(".mjs")) {
      const newFilePath = filePath.slice(0, -4) + ".js";
      fs.renameSync(filePath, newFilePath);
    }
  });
}

// Rename `.mjs` files to `.js`, since there's no better way to
// configure TypeScript's emitted extension.
renameFiles(path.join(__dirname, "..", "dist", "cjs"));
