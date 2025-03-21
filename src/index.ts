import fs from 'fs'
import path from 'path'

import { globSync } from 'glob'
import { minimatch } from 'minimatch'

import { ScssGlobLoaderContext, ScssGlobLoaderOptions } from './types'

export default function sassGlobImports(this: ScssGlobLoaderContext, source: string): void {
    const callback = this.async()
    const options = this.getOptions() as ScssGlobLoaderOptions
    const ignorePaths = options.ignorePaths || []
    const namespace = options.namespace

    // Replace glob imports with actual imports
    const processedSource = source.replace(
        /^([ \t]*(?:\/\*.*\*\/)?)@(import|use|include)\s+(meta\.load-css\()?["']([^"']+\*[^"']*(?:\.scss|\.sass)?)["']\)?;?([ \t]*(?:\/[/*].*)?)$/gm,
        (match: string, p1: string, importType: string, metaLoadException: string, globPattern: string, p5: string) => {
            const isSass = match.match(/\.sass/i) !== null

            const currentFileDir = path.dirname(this.resourcePath)
            const searchBases = [currentFileDir]

            let files: string[] = []
            let basePath = ''

            for (let i = 0; i < searchBases.length; i++) {
                basePath = searchBases[i]
                files = globSync(path.join(basePath, globPattern), {
                    cwd: basePath,
                    windowsPathsNoEscape: true
                }).sort((a, b) => a.localeCompare(b, 'en'))

                // Check if directories exist
                const globPatternWithoutWildcard = globPattern.split('*')[0]
                if (globPatternWithoutWildcard.length) {
                    const directoryExists = fs.existsSync(path.join(basePath, globPatternWithoutWildcard))
                    if (!directoryExists) {
                        console.warn(`Sass Glob Import: Directories don't exist for the glob pattern "${globPattern}"`)
                    }
                }

                if (files.length > 0) break
            }

            let imports: string[] = []
            files.forEach((filename: string) => {
                if (filename.match(/\.(scss|sass)$/i)) {
                    filename = path.relative(basePath, filename).replace(/\\/g, '/')
                    filename = filename.replace(/^\//, '')

                    if (!ignorePaths.some((ignorePath: string) => minimatch(filename, ignorePath))) {
                        if (importType === 'use') {
                            let namespaceExport = ''

                            // Handle namespace based on options
                            if (typeof namespace === 'function') {
                                // Custom namespace function
                                const tempNamespace = namespace(filename, files.indexOf(filename))
                                if (tempNamespace) {
                                    namespaceExport = ` as ${tempNamespace}`
                                }
                            } else if (typeof namespace === 'string') {
                                // Use wildcard namespace
                                namespaceExport = ` as ${namespace}`
                            } else if (typeof namespace === 'boolean' && namespace) {
                                // Default namespace behavior
                                const pathParts = filename.split('/')
                                const directories = pathParts.slice(0, -1)
                                    .filter(part => part !== '..')
                                const fileName = pathParts[pathParts.length - 1]?.replace(/[_.]scss$/, '').replace(/_/g, '') || ''
                                const tempNamespace = [...directories, fileName].join('-')
                                if (tempNamespace.length) {
                                    namespaceExport = ` as ${tempNamespace}`
                                }
                            }

                            imports.push(`@${importType} "${filename}"${namespaceExport}${isSass ? '' : ';'}`)
                        } else if (importType === 'include' && metaLoadException) {
                            imports.push(`@${importType} meta.load-css("${filename}")${isSass ? '' : ';'}`)
                        } else {
                            imports.push(`@${importType} "${filename}"${isSass ? '' : ';'}`)
                        }
                    }
                }
            })

            if (p1) imports.unshift(p1)
            if (p5) imports.push(p5)

            imports = imports.filter((item: string) => item.trim() !== '')
            return imports.join('\n')
        }
    )

    callback(null, processedSource)
}
