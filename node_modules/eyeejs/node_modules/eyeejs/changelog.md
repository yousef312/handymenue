# Changelog

## [2.1.1] - 2025-07-01

**Breaking News!**

we've added a new feature in our little library!

### Added

 - introducing a new feature `model`, where you can create models and use them multiple times around your code, without having to create the whole shit over and over, similar to react components but with less multi-files headache(check out readme.md to more tutorial of how to use).

 - `class` attribute now can accept a string concatenation of classes beside an array of them, so instead of `eye("div",{ class: ["class1","class2"]})` you can do `eye("div",{ class: "class1 class2" })`.