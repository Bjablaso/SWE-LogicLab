/** @type {import('@babel/core').ConfigFunction} */
module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./src'],
                    extensions: ['.ios.ts', '.android.ts', '.ts', '.tsx', '.js', '.jsx', '.json'],
                    alias: {
                        "@components": "./src/component",
                        '@constants': './src/constants',

                        // add this once you create src/theme/index.ts (or src/theme.ts):
                        // '@theme': './src/theme',
                    },
                },
            ],
        ],
    };
};