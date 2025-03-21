// src/index.ts
import fs from "fs";
import path from "path";
import { globSync } from "glob";
import { minimatch } from "minimatch";
function sassGlobImports(source) {
  const callback = this.async();
  const options = this.getOptions();
  const ignorePaths = options.ignorePaths || [];
  const namespace = options.namespace;
  const processedSource = source.replace(
    /^([ \t]*(?:\/\*.*\*\/)?)@(import|use|include)\s+(meta\.load-css\()?["']([^"']+\*[^"']*(?:\.scss|\.sass)?)["']\)?;?([ \t]*(?:\/[/*].*)?)$/gm,
    (match, p1, importType, metaLoadException, globPattern, p5) => {
      const isSass = match.match(/\.sass/i) !== null;
      const currentFileDir = path.dirname(this.resourcePath);
      const searchBases = [currentFileDir];
      let files = [];
      let basePath = "";
      for (let i = 0; i < searchBases.length; i++) {
        basePath = searchBases[i];
        files = globSync(path.join(basePath, globPattern), {
          cwd: basePath,
          windowsPathsNoEscape: true
        }).sort((a, b) => a.localeCompare(b, "en"));
        const globPatternWithoutWildcard = globPattern.split("*")[0];
        if (globPatternWithoutWildcard.length) {
          const directoryExists = fs.existsSync(path.join(basePath, globPatternWithoutWildcard));
          if (!directoryExists) {
            console.warn(`Sass Glob Import: Directories don't exist for the glob pattern "${globPattern}"`);
          }
        }
        if (files.length > 0) break;
      }
      let imports = [];
      files.forEach((filename) => {
        var _a;
        if (filename.match(/\.(scss|sass)$/i)) {
          filename = path.relative(basePath, filename).replace(/\\/g, "/");
          filename = filename.replace(/^\//, "");
          if (!ignorePaths.some((ignorePath) => minimatch(filename, ignorePath))) {
            if (importType === "use") {
              let namespaceExport = "";
              if (typeof namespace === "function") {
                const tempNamespace = namespace(filename, files.indexOf(filename));
                if (tempNamespace) {
                  namespaceExport = ` as ${tempNamespace}`;
                }
              } else if (typeof namespace === "string") {
                namespaceExport = ` as ${namespace}`;
              } else if (typeof namespace === "boolean" && namespace) {
                const pathParts = filename.split("/");
                const directories = pathParts.slice(0, -1).filter((part) => part !== "..");
                const fileName = ((_a = pathParts[pathParts.length - 1]) == null ? void 0 : _a.replace(/[_.]scss$/, "").replace(/_/g, "")) || "";
                const tempNamespace = [...directories, fileName].join("-");
                if (tempNamespace.length) {
                  namespaceExport = ` as ${tempNamespace}`;
                }
              }
              imports.push(`@${importType} "${filename}"${namespaceExport}${isSass ? "" : ";"}`);
            } else if (importType === "include" && metaLoadException) {
              imports.push(`@${importType} meta.load-css("${filename}")${isSass ? "" : ";"}`);
            } else {
              imports.push(`@${importType} "${filename}"${isSass ? "" : ";"}`);
            }
          }
        }
      });
      if (p1) imports.unshift(p1);
      if (p5) imports.push(p5);
      imports = imports.filter((item) => item.trim() !== "");
      return imports.join("\n");
    }
  );
  callback(null, processedSource);
}
export {
  sassGlobImports as default
};
