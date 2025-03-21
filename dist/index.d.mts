import { LoaderContext } from 'webpack';

interface ScssGlobLoaderOptions {
    namespace?: string | ((filepath: string, index: number) => string);
    ignorePaths?: string[];
}
interface ScssGlobLoaderContext extends LoaderContext<ScssGlobLoaderOptions> {
    resourcePath: string;
    async(): (err?: Error | null, content?: string | Buffer, sourceMap?: string | any, additionalData?: any) => void;
}

declare function sassGlobImports(this: ScssGlobLoaderContext, source: string): void;

export { sassGlobImports as default };
