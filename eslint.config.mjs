import antfu from '@antfu/eslint-config'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import perfectionist from 'eslint-plugin-perfectionist'

export default antfu(
  {
    formatters: false,
    ignores: [
      '!.env.example',
      '.DS_Store',
      '.env.*',
      '.git',
      '**/*/.svelte-kit',
      '.vercel',
      '**/*/src/app.html',
      'src/app.html',
      '**/*/build/',
      '**/*/dist/',
      'node_modules/',
      'package/',
      'postcss.config.js',
      'tsconfig.tsbuildinfo'
    ],
    isInEditor: false,
    jsonc: false,
    lessOpinionated: true,
    markdown: false,
    rules: {
      'arrow-body-style': ['error', 'as-needed'],
      'func-style': ['error', 'expression', { allowArrowFunctions: true }]
    },
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: false
    },
    svelte: true,
    toml: false,
    typescript: {
      overrides: {
        'no-use-before-define': 'off',
        'ts/consistent-type-definitions': ['error', 'type'],
        'ts/consistent-type-imports': [
          'error',
          {
            disallowTypeAnnotations: false,
            fixStyle: 'separate-type-imports',
            prefer: 'type-imports'
          }
        ],
        'ts/no-unused-vars': [
          'error',
          {
            args: 'all',
            argsIgnorePattern: '^_',
            caughtErrors: 'all',
            caughtErrorsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            ignoreRestSiblings: true,
            varsIgnorePattern: '^_'
          }
        ],
        'ts/no-use-before-define': [
          'error',
          {
            classes: false,
            enums: false,
            functions: true,
            ignoreTypeReferences: true,
            typedefs: false,
            variables: true
          }
        ]
      }
    },
    vue: false,
    yaml: false
  },
  {
    files: ['**/*.d.ts'],
    rules: { 'ts/consistent-type-definitions': ['off'] }
  },
  {
    ...betterTailwindcss.configs['stylistic-error'],
    rules: {
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off'
    },
    settings: {
      'better-tailwindcss': {
        callees: ['tv'],
        entryPoint: './src/app.css'
      }
    }
  }
)
  .override('antfu/stylistic/rules', {
    rules: {
      'style/arrow-parens': ['error', 'always'],
      'style/brace-style': ['error', '1tbs'],
      'style/comma-dangle': ['error', 'never'],
      'style/indent': [
        'error',
        2,
        {
          flatTernaryExpressions: true,
          offsetTernaryExpressions: true,
          SwitchCase: 1
        }
      ],
      'style/no-multiple-empty-lines': ['error', { max: 1 }],
      'style/operator-linebreak': [
        'error',
        'after',
        {
          overrides: { ':': 'before', '?': 'before' }
        }
      ],
      'style/quote-props': ['error', 'as-needed']
    }
  })
  .override('antfu/svelte/rules', {
    ignores: ['**/*.svelte.ts'],
    rules: {
      'style/indent-binary-ops': ['error', 4],
      'svelte/html-closing-bracket-new-line': ['error'],
      'svelte/html-quotes': ['error', { prefer: 'double' }],
      'svelte/indent': ['error', { indent: 4 }],
      'svelte/max-attributes-per-line': [
        'error',
        { multiline: 1, singleline: 3 }
      ],
      'svelte/no-inspect': ['error']
    }
  })
  .override('antfu/perfectionist/setup', {
    rules: {
      ...(perfectionist.configs['recommended-alphabetical'].rules ?? {}),
      'perfectionist/sort-exports': [
        'error',
        {
          ignoreCase: true,
          order: 'asc',
          type: 'alphabetical'
        }
      ],
      'perfectionist/sort-imports': [
        'error',
        {
          environment: 'bun',
          groups: [
            'style',
            'type',
            ['builtin', 'external'],
            ['parent', 'sibling', 'index'],
            'internal',
            'unknown'
          ],
          ignoreCase: true,
          internalPattern: ['\\$[^\\/]+\\/[^\\/]+'],
          maxLineLength: undefined,
          newlinesBetween: 1,
          order: 'asc',
          type: 'alphabetical'
        }
      ],
      'perfectionist/sort-modules': 'off',
      'perfectionist/sort-object-types': 'off',
      'perfectionist/sort-objects': [
        'error',
        {
          partitionByComment: true,
          partitionByNewLine: true
        }
      ]
    }
  })
