PatternLock
===========

A light weight plugin to simulate android like pattern lock mechanism for your hybrid app or for a website. It's easy to configure and style so you can have different type of pattern lock according to your need. Is also provide some methods to use this plugin securely.

### Installation
The easiest way to use PatternLock is to install it from npm and build it into your app with Webpack.

```js
npm install patternlock
```

You can then import react-select and its styles in your application as follows:

```js
import PatternLock from 'patternlock';
import 'patternlock/dist/patternlock.css'; //or import this directly on css file if you are not using any bundler 
```

You can also use the standalone UMD build by including `dist/patternlock.min.js` and `dist/patternlock.min.css` in your page.

### Documentation

Check demo and documentation on <a href="http://ignitersworld.com/lab/patternLock.html#example">http://ignitersworld.com/lab/patternLock.html</a>

### Major updates

**v2.0.0**
- Removed jQuery dependency
- Rewrite on es6
- Added rollup to bundle and parcel to run dev environment
- Removed bower and jquery json

**v1.0.1**
- Added a option to allow repeating over dots.
- Added on npm.
- Fixed setPattern bug for larger matrix.
- Fixed invalid pattern #15, #3
- Fixed direction classes issue while directly moving to non near dots.

**v0.6.0**
- UMD (AMD, CommonJS) support.

**v0.5.0**
- Added directional classes, dir, n,s,e,w,n-e,n-w,s-e,s-w.

**v0.4.0**
- Added setPattern, disable, enable methods.

**v0.3.0**
- Fixed patternlock support on devices having both mouse and touch input.
