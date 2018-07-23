module.exports = {
    target: 'electron-renderer',
    entry: './html/react/index.js',
    output: {
        path: __dirname+"/html/react/",
        filename: 'build.js'
    },
    module: {rules: [{
        exclude: /node_modules/,
        loader: 'babel-loader'
    }
    ]}
};