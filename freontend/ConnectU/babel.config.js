/** @type {import('@babel/core').ConfigFunction} */

module .exports = function (api: { cache: (arg0: boolean) => void }) {
    api.cache(true)
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./src'],
                    extensions: ['.ios.ts', '.android.ts', '.ts', '.tsx', '.js', '.jsx', '.json'],
                    alias: {
                       // '@theme': './src/theme',
                        '@app': './src/app',
                        '@constants': './src/constants',
                     //   '@context': './src/context',
                      //  '@components': './src/components',
                       // '@hooks': './src/hooks',
                    },
                }
            ]
        ]
    }

}