# Back-End
You need to run these command in terminal (npm i express nodemon pg)
Install dotenv extension and then run in terminal (npm install dotenv)
To run it (npm run live)
npm install --save-dev @types/swagger-ui-express @types/swagger-jsdoc


# Coding Style

## Prettier Configuration
We use **Prettier** for code formatting to maintain consistency across the codebase. Below is our Prettier configuration:

```json
{
    "useTabs": true,
    "semi": true,
    "singleQuote": true,
    "printWidth": 100,
    "endOfLine": "crlf",
    "tabWidth": 4
}
```

### Configuration Breakdown:
- **`useTabs`**: `true` → Indentation is done using tabs instead of spaces.
- **`semi`**: `true` → Semicolons are required at the end of statements.
- **`singleQuote`**: `true` → Single quotes are preferred over double quotes.
- **`printWidth`**: `100` → Maximum line length is set to 100 characters.
- **`endOfLine`**: `"crlf"` → Ensures line endings are consistent with Windows (`CRLF`).
- **`tabWidth`**: `4` → Tabs are set to a width equivalent to 4 spaces.

## ESLint Configuration
We use **ESLint** with TypeScript support to enforce best practices and catch potential errors. Below is our ESLint configuration:

```javascript
module.exports = {
    parser: "@typescript-eslint/parser",
    extends: ["plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
    rules: {
        "@typescript-eslint/naming-convention": [
            "error",
            {
                "selector": "variableLike",
                "format": ["camelCase"]
            }
        ]
    }
};
```

### Configuration Breakdown:
- **`parser`**: `@typescript-eslint/parser` → Enables ESLint to parse TypeScript syntax.
- **`extends`**:
  - `"plugin:@typescript-eslint/recommended"` → Enables recommended linting rules for TypeScript.
  - `"plugin:prettier/recommended"` → Ensures compatibility with Prettier and prevents conflicts between ESLint and Prettier.
- **`rules`**:
    Enforces camelCase naming convention for variables and functions.

## Usage
To apply these configurations in your project, make sure you have the required dependencies installed:

```sh
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier eslint-plugin-prettier
```

You can run ESLint and Prettier using:

```sh
npx eslint . --fix  # Lint and auto-fix issues
npx prettier --write .  # Format files using Prettier
```

You can run ESLint and Prettier in Our project using:

```sh
npm run lint
``` 

This ensures that all code follows the defined linting and formatting rules, improving code consistency and maintainability.
