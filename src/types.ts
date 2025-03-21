import { LoaderContext } from 'webpack'

export interface ScssGlobLoaderOptions {
  namespace?: string | ((filepath: string, index: number) => string)
  ignorePaths?: string[]
}

export interface ScssGlobLoaderContext extends LoaderContext<ScssGlobLoaderOptions> {
  resourcePath: string
  async(): (err?: Error | null, content?: string | Buffer, sourceMap?: string | any, additionalData?: any) => void
}
