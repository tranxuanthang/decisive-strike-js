module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'decisive-strike.min.js',
    library: {
      type: 'umd',
      name: 'decisive-strike',
    }
  },
  mode: 'production'
}
