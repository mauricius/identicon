module.exports = {
  target: 'webworker',
  entry: './src/all.js',
  mode: 'production',
  optimization: {
    minimize: true,
  },
  performance: {
    hints: false,
  },
  output: {
    path: __dirname + '/dist',
    publicPath: 'dist',
    filename: 'worker.js',
  },
}
