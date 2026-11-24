module.exports = function (eleventyConfig) {
  // Copy static assets straight through, unchanged
  [
    "styles.css", "app.js", "photos", "brand", "Gesta",
    "admin", "_headers", "robots.txt", "sitemap.xml",
  ].forEach((p) => eleventyConfig.addPassthroughCopy("src/" + p));
  eleventyConfig.addPassthroughCopy("src/*.mp4");
  eleventyConfig.addPassthroughCopy("src/*.jpg");
  eleventyConfig.addPassthroughCopy("src/*.pdf");

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk"],
  };
};
