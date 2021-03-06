import { _getBaseName, _isNodeModules, _normalizeWebpackPath } from "../../../src/lib/actions/base";

describe("lib/actions/base", () => {
  describe("_isNodeModules", () => {
    it("handles base cases", () => {
      expect(_isNodeModules("")).to.equal(false);
      expect(_isNodeModules("foo.js")).to.equal(false);
      expect(_isNodeModules("./foo.js")).to.equal(false);
      expect(_isNodeModules(".\\foo.js")).to.equal(false);
      expect(_isNodeModules("bar/foo.js")).to.equal(false);
      expect(_isNodeModules("bar\\foo.js")).to.equal(false);
      expect(_isNodeModules("node_modulesM/bar/foo.js")).to.equal(false);
      expect(_isNodeModules("node_modulesM\\bar\\foo.js")).to.equal(false);
    });

    it("removes node_modules", () => {
      expect(_isNodeModules("./node_modules/foo.js")).to.equal(true);
      expect(_isNodeModules(".\\node_modules\\foo.js")).to.equal(true);
      expect(_isNodeModules("node_modules/bar/foo.js")).to.equal(true);
      expect(_isNodeModules("node_modules\\bar\\foo.js")).to.equal(true);
    });

    it("removes repeated node_modules", () => {
      expect(_isNodeModules("./node_modules/baz/node_modules/foo.js")).to.equal(true);
      expect(_isNodeModules(".\\node_modules\\baz\\node_modules\\foo.js")).to.equal(true);
      expect(_isNodeModules("bruh/node_modules/bar/foo.js")).to.equal(true);
      expect(_isNodeModules("bruh\\node_modules\\bar\\foo.js")).to.equal(true);
    });

    // All of this behavior is negotiable.
    it("handles weird cases that should never come up", () => {
      expect(_isNodeModules("node_modules")).to.equal(true);
      expect(_isNodeModules("node_modules/")).to.equal(true);
      expect(_isNodeModules("./node_modules")).to.equal(true);
      expect(_isNodeModules("./foo/bar/node_modules")).to.equal(true);
    });
  });

  describe("_normalizeWebpackPath", () => {
    it("handles base cases", () => {
      expect(_normalizeWebpackPath("")).to.equal("");
      expect(_normalizeWebpackPath("foo.js")).to.equal("foo.js");
      expect(_normalizeWebpackPath("/foo.js")).to.equal("/foo.js");
      expect(_normalizeWebpackPath("\\foo.js")).to.equal("\\foo.js");
      expect(_normalizeWebpackPath("bar/foo.js")).to.equal("bar/foo.js");
      expect(_normalizeWebpackPath("bar\\foo.js")).to.equal("bar\\foo.js");
      expect(_normalizeWebpackPath("/bar/foo.js")).to.equal("/bar/foo.js");
      expect(_normalizeWebpackPath("x:\\bar\\foo.js")).to.equal("x:\\bar\\foo.js");
    });

    // tslint:disable max-line-length
    it("handles loaders", () => {
      expect(_normalizeWebpackPath("/PATH/TO/node_modules/css-loader/lib/css-base.js"))
        .to.equal("/PATH/TO/node_modules/css-loader/lib/css-base.js");
      expect(_normalizeWebpackPath("/PATH/TO/node_modules/next/dist/build/webpack/loaders/next-babel-loader.js??ref--4!/PATH/TO/node_modules/pkg/foo.js"))
        .to.equal("/PATH/TO/node_modules/pkg/foo.js");
      expect(_normalizeWebpackPath("/PATH/TO/node_modules/css-loader/index.js??ref--7-1!/PATH/TO/node_modules/postcss-loader/lib/index.js??ref--7-2!/PATH/TO/node_modules/@scope/foo/package.css"))
        .to.equal("/PATH/TO/node_modules/@scope/foo/package.css");
      expect(_normalizeWebpackPath("/PATH/TO/node_modules/css-loader/index.js??ref--7-1!/PATH/TO/node_modules/postcss-loader/lib/index.js??ref--7-2!/PATH/TO/node_modules/@scope/foo/package.css 0"))
        .to.equal("/PATH/TO/node_modules/@scope/foo/package.css 0");

      expect(_normalizeWebpackPath("/PATH/TO/node_modules/next/dist/build/webpack/loaders/next-babel-loader.js??ref--4!/PATH/TO/src/modules/debug/foo.js"))
        .to.equal("/PATH/TO/src/modules/debug/foo.js");
      expect(_normalizeWebpackPath("/PATH/TO/node_modules/css-loader/index.js??ref--7-1!/PATH/TO/node_modules/postcss-loader/lib/index.js??ref--7-2!/PATH/TO/src/bar/my-style.css"))
        .to.equal("/PATH/TO/src/bar/my-style.css");
    });

    it("handles loaders with name param", () => {
      expect(_normalizeWebpackPath("/PATH/TO/node_modules/css-loader/lib/css-base.js",
        "/PATH/TO/~/css-loader/lib/css-base.js"))
        .to.equal("/PATH/TO/node_modules/css-loader/lib/css-base.js");
      expect(_normalizeWebpackPath("/PATH/TO/node_modules/css-loader/lib/css-base.js",
        "/PATH/TO/~/css-loader/lib/css-base.js"))
        .to.equal("/PATH/TO/node_modules/css-loader/lib/css-base.js");
      expect(_normalizeWebpackPath("/PATH/TO/node_modules/css-loader/lib/css-base.js",
        "./node_modules/css-loader/lib/css-base.js"))
        .to.equal("/PATH/TO/node_modules/css-loader/lib/css-base.js");
      expect(_normalizeWebpackPath("/PATH/TO/node_modules/css-loader/index.js??ref--7-1!/PATH/TO/node_modules/postcss-loader/lib/index.js??ref--7-2!/PATH/TO/node_modules/@scope/foo/package.css"))
        .to.equal("/PATH/TO/node_modules/@scope/foo/package.css");

      expect(_normalizeWebpackPath("/PATH/TO/node_modules/css-loader/index.js??ref--7-1!/PATH/TO/node_modules/postcss-loader/lib/index.js??ref--7-2!/PATH/TO/node_modules/@scope/foo/package.css 0",
        "/PATH/TO/~/@scope/foo/package.css"))
        .to.equal("/PATH/TO/node_modules/@scope/foo/package.css");
      expect(_normalizeWebpackPath("x:\\PATH\\TO\\node_modules\\css-loader\\index.js??ref--7-1!x:\\PATH\\TO\\node_modules\\postcss-loader\\lib\\index.js??ref--7-2!x:\\PATH\\TO\\node_modules\\@scope\\foo\\package.css 0",
        "x:\\PATH\\TO\\~\\@scope\\foo\\package.css"))
        .to.equal("x:\\PATH\\TO\\node_modules\\@scope\\foo\\package.css");
      expect(_normalizeWebpackPath("/PATH/TO/node_modules/css-loader/index.js??ref--7-1!/PATH/TO/node_modules/postcss-loader/lib/index.js??ref--7-2!/PATH/TO/node_modules/@scope/foo/package.css 0",
        "/PATH/TO/node_modules/@scope/foo/package.css"))
        .to.equal("/PATH/TO/node_modules/@scope/foo/package.css");
      expect(_normalizeWebpackPath("x:\\PATH\\TO\\node_modules\\css-loader\\index.js??ref--7-1!x:\\PATH\\TO\\node_modules\\postcss-loader\\lib\\index.js??ref--7-2!x:\\PATH\\TO\\node_modules\\@scope\\foo\\package.css 0",
        "x:\\PATH\\TO\\node_modules\\@scope\\foo\\package.css"))
        .to.equal("x:\\PATH\\TO\\node_modules\\@scope\\foo\\package.css");
      expect(_normalizeWebpackPath("/PATH/TO/node_modules/css-loader/index.js??ref--7-1!/PATH/TO/node_modules/postcss-loader/lib/index.js??ref--7-2!/PATH/TO/node_modules/@scope/foo/package.css 0",
        "./node_modules/@scope/foo/package.css"))
        .to.equal("/PATH/TO/node_modules/@scope/foo/package.css");
      expect(_normalizeWebpackPath("x:\\PATH\\TO\\node_modules\\css-loader\\index.js??ref--7-1!x:\\PATH\\TO\\node_modules\\postcss-loader\\lib\\index.js??ref--7-2!x:\\PATH\\TO\\node_modules\\@scope\\foo\\package.css 0",
        "node_modules\\@scope\\foo\\package.css"))
        .to.equal("x:\\PATH\\TO\\node_modules\\@scope\\foo\\package.css");
      expect(_normalizeWebpackPath("x:\\PATH\\TO\\node_modules\\css-loader\\index.js??ref--7-1!x:\\PATH\\TO\\node_modules\\postcss-loader\\lib\\index.js??ref--7-2!x:\\PATH\\TO\\node_modules\\@scope\\foo\\package.css 0",
        ".\\node_modules\\@scope\\foo\\package.css"))
        .to.equal("x:\\PATH\\TO\\node_modules\\@scope\\foo\\package.css");
    });
    // tslint:enable max-line-length
  });

  describe("_getBaseName", () => {
    it("removes node_modules", () => {
      expect(_getBaseName("./node_modules/foo.js")).to.equal("foo.js");
      expect(_getBaseName(".\\node_modules\\foo.js")).to.equal("foo.js");
      expect(_getBaseName("node_modules/bar/foo.js")).to.equal("bar/foo.js");
      expect(_getBaseName("node_modules\\bar\\foo.js")).to.equal("bar/foo.js");
    });

    it("removes repeated node_modules", () => {
      expect(_getBaseName("./node_modules/baz/node_modules/foo.js")).to.equal("foo.js");
      expect(_getBaseName(".\\node_modules\\baz\\node_modules\\foo.js")).to.equal("foo.js");
      expect(_getBaseName("bruh/node_modules/bar/foo.js")).to.equal("bar/foo.js");
      expect(_getBaseName("bruh\\node_modules\\bar\\foo.js")).to.equal("bar/foo.js");
    });

    it("handles synthetic modules", () => {
      expect(_getBaseName("node_modules/moment/locale sync /es/"))
        .to.equal("moment/locale sync /es/");
      expect(_getBaseName("node_modules\\moment/locale sync /es/"))
        .to.equal("moment/locale sync /es/");
    });

    // All of this behavior is negotiable.
    it("handles weird cases that should never come up", () => {
      expect(_getBaseName("node_modules")).to.equal("");
      expect(_getBaseName("node_modules/")).to.equal("");
      expect(_getBaseName("./node_modules")).to.equal("");
      expect(_getBaseName("./foo/bar/node_modules")).to.equal("");
    });
  });
});
