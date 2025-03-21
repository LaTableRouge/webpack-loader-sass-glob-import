# webpack-loader-sass-glob-import

A webpack loader that enables glob imports in SCSS files. This loader allows you to use glob patterns in your SCSS imports, making it easier to import multiple files at once.

## Introduction

`scss-glob-loader` is a webpack loader that allows you to use glob patterns in your Sass or SCSS files. This simplifies the process of importing multiple files, making your stylesheets more modular and easier to maintain.

## Installation

```bash
npm install --save-dev scss-glob-loader
```

## Configuration

Add the loader to your webpack configuration:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
          {
            loader: "scss-glob-loader",
            options: {},
          },
        ],
      },
    ],
  },
};
```

## Features

- Supports glob patterns in `@import`, `@use`, and `@include` statements
- Namespace is mandatory when using `@use` with glob patterns
- Flexible namespace generation for `@use` imports
- Preserves comments and whitespace
- Supports both `.scss` and `.sass` files
- Provides warning messages for invalid glob paths

## Namespace Options

The loader supports three namespace modes:

1. **Default Mode** (`namespace: true`):

   ```javascript
   {
     loader: 'scss-glob-loader',
   }
   ```

   Generates namespaces based on file paths:

   - File: `components/_button.scss` → Namespace: `components-button`
   - File: `blocks/header/styles/_nav.scss` → Namespace: `blocks-header-styles-nav`

2. **Wildcard Mode** (`namespace: '*'`):

   ```javascript
   {
     loader: 'scss-glob-loader',
     options: {
       namespace: '*'
     }
   }
   ```

   Uses `*` as namespace for all files:

   ```scss
   @use "components/*.scss" as *;
   ```

3. **Custom Function** (`namespace: (filename, index) => string`):
   ```javascript
   {
     loader: 'scss-glob-loader',
     options: {
       namespace: (filename, index) => {
         // Custom namespace logic
         return `custom-namespace-${index}`;
       }
     }
   }
   ```
   Allows you to define your own namespace generation logic.

## Usage Examples

### Basic Usage

```scss
// Import all SCSS files in a directory
@import "components/*.scss";

// Use all SCSS files in a directory with auto-generated namespaces
@use "components/*.scss";

// Include all SCSS files in a directory with meta.load-css
@include meta.load-css("components/*.scss");
```

### Advanced Usage

```scss
// Import specific file types
@import "components/**/*.scss";

// Use with wildcard namespace
@use "components/*.scss" as *;

// Use with custom namespace function
@use "components/*.scss";

// Include with meta.load-css
.your-class {
  @include meta.load-css("components/*.scss");
}
```

### Directory Structure Example

```
styles/
├── components/
│   ├── _button.scss
│   ├── _card.scss
│   └── _nav.scss
├── utils/
│   ├── _variables.scss
│   └── _mixins.scss
└── main.scss
```

```scss
// In main.scss
@use "components/*.scss";
@use "utils/*.scss";

// Will be transformed to:
@use "components/button.scss" as components-button;
@use "components/card.scss" as components-card;
@use "components/nav.scss" as components-nav;
@use "utils/variables.scss" as utils-variables;
@use "utils/mixins.scss" as utils-mixins;
```

## Caveats

- Globbing only works in a top-level file, not within referenced files
- The loader processes files in alphabetical order
- File paths are case-sensitive
- Only supports `*` and `**` glob patterns
- Requires webpack 5 or higher

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
