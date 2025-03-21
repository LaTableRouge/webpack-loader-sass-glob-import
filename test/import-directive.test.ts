import fs from 'fs';
import path from 'path';

import { glob } from 'glob';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import sassGlobImports from '../src';
import { ScssGlobLoaderContext } from '../src/types';

// Mock fs, glob and path
vi.mock('fs');
vi.mock('glob');
vi.mock('path');

const source = `
body {}
@import "./files/*.scss";
`;
const sourceSASS = `
body {}
@import "./files/*.sass";
`;

// Mock glob results
const mockFiles = [
  'files/_file-a.scss',
  'files/_file-b.scss'
];
const mockFilesSASS = [
  'files/_file-a.sass',
  'files/_file-b.sass'
];

describe('@import directive with glob patterns', () => {
  const mockContext: ScssGlobLoaderContext = {
    resourcePath: '/test/file.scss',
    getOptions: vi.fn().mockReturnValue({}),
    async: vi.fn().mockReturnValue((err: Error | null, content?: string) => {
      if (err) throw err
      return content
    }),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(glob.globSync).mockReturnValue(mockFiles);
    // Mock path.resolve to return the same path
    vi.mocked(path.resolve).mockImplementation((...args) => args[args.length - 1]);
    // Mock path.relative to return the filename without the base path
    vi.mocked(path.relative).mockImplementation((basePath, filePath) => {
      return filePath.replace(basePath, '').replace(/^\//, '');
    });
  });

  it('converts glob patterns to inline imports', () => {
    const expected = `
body {}
@import "files/_file-a.scss";
@import "files/_file-b.scss";
`;
    let actualOutput = '';
    const callback = (err: Error | null, content?: string) => {
      if (err) throw err;
      actualOutput = content || '';
    };
    (mockContext.async as unknown as ReturnType<typeof vi.fn>).mockReturnValue(callback);

    sassGlobImports.call(mockContext, source);

    expect(actualOutput).toBe(expected);
    expect(mockContext.async).toHaveBeenCalled();
  });
});

describe('@import directive with .sass syntax', () => {
  const mockContext: ScssGlobLoaderContext = {
    resourcePath: '/test/file.sass',
    getOptions: vi.fn().mockReturnValue({}),
    async: vi.fn().mockReturnValue((err: Error | null, content?: string) => {
      if (err) throw err
      return content
    }),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(glob.globSync).mockReturnValue(mockFilesSASS);
    // Mock path.resolve to return the same path
    vi.mocked(path.resolve).mockImplementation((...args) => args[args.length - 1]);
    // Mock path.relative to return the filename without the base path
    vi.mocked(path.relative).mockImplementation((basePath, filePath) => {
      return filePath.replace(basePath, '').replace(/^\//, '');
    });
  });

  it('converts glob patterns to inline imports without semicolons', () => {
    const expected = `
body {}
@import "files/_file-a.sass"
@import "files/_file-b.sass"
`;
    let actualOutput = '';
    const callback = (err: Error | null, content?: string) => {
      if (err) throw err;
      actualOutput = content || '';
    };
    (mockContext.async as unknown as ReturnType<typeof vi.fn>).mockReturnValue(callback);

    sassGlobImports.call(mockContext, sourceSASS);

    expect(actualOutput).toBe(expected);
    expect(mockContext.async).toHaveBeenCalled();
  });
});

describe('@import directive with invalid glob paths', () => {
  const mockContext: ScssGlobLoaderContext = {
    resourcePath: '/test/file.scss',
    getOptions: vi.fn().mockReturnValue({}),
    async: vi.fn().mockReturnValue((err: Error | null, content?: string) => {
      if (err) throw err
      return content
    }),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(glob.globSync).mockReturnValue([]);
    // Mock path.resolve to return the same path
    vi.mocked(path.resolve).mockImplementation((...args) => args[args.length - 1]);
    // Mock path.relative to return the filename without the base path
    vi.mocked(path.relative).mockImplementation((basePath, filePath) => {
      return filePath.replace(basePath, '').replace(/^\//, '');
    });
  });

  it('warns when glob path does not exist', () => {
    let source = `
body {}
@import "foo/**/*.scss";
`;
    const expected = `
body {}

`;
    let actualOutput = '';
    const callback = (err: Error | null, content?: string) => {
      if (err) throw err;
      actualOutput = content || '';
    };
    (mockContext.async as unknown as ReturnType<typeof vi.fn>).mockReturnValue(callback);

    vi.spyOn(console, 'warn');
    sassGlobImports.call(mockContext, source);

    expect(actualOutput).toBe(expected);
    expect(mockContext.async).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledTimes(1);
  });
});