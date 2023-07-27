module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        debug: false,
        useBuiltIns: "entry",
        corejs: 3,
        targets: {
          browsers: ["last 2 versions", "not ie > 0", "not ie_mob > 0"],
        },
      },
    ],
  ],
};
