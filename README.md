# spun [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coveralls Status][coveralls-image]][coveralls-url]
> Rapid Selenium Testing

`spun` is a command line tool that compiles `spun` files down to selenium code.  The
output may be anything from `node` to `java` to `ruby`.  The idea is that you can
author a language agnostic selenium specification and run it on any platform.

`spun` relies on `strategy providers` to convert a spun file down to a languge.
`spun` will search `package.json` for the first dependency prefixed with
`spun-`.  Because a `strategy provider` is likely to include [spun-util](https://github.com/spunjs/spun-util.git),
`spun-util` is ignored in this search.

`spun` also assumes that by default your language compiles down to `node`.  By default
`spun` will attempt to run the results using `node`.  You an override this behavior
using [the options](#options).

The default provider is [spun-selenium-webdriver](https://github.com/spunjs/spun-selenium-webdriver)

## Contents
* [Why the name?](#whyTheName)
* [Example spun file](#exampleSpunFile)
* [CLI](#options)

<a name="whyTheName" />
## Why the name?
A google search for `spun definition` resulted in this:

Webster:
```
  past or present of spin.
```

Not very cool.

Urban:
```
  1. A state of mind that exists because of using an amphetamine for a prolonged amount of time through repeated ingestion.
  2. To be under the influence of almost any stimulant, such as meth, straight speed...

  Usage: "Man I'm spun out on crack..."
```

Not very cool either.

A goole search for `selenium definition` resulted in this:
```
  the chemical element of atomic number 34, a gray crystalline nonmetal with semiconducting properties.
```

Hmm, a chemical element.  Yeureeka!  `spun` let's you get `spun` out on `selenium`!

Still not very cool ;)

<a name="exampleSpunFile" />
## Example spun file

```spun
get "http://google.com"
find "[name=username]"
type "username"
find "[name=password]"
type "password"
click "#login-button"
get "/news"
quit
```

<a name="options"/>
## Options

Run `spun -h` for usage.

##LICENSE
``````
The MIT License (MIT)

Copyright (c) 2014 Joseph Spencer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
``````

[downloads-image]: http://img.shields.io/npm/dm/spun.svg
[npm-url]: https://npmjs.org/package/spun
[npm-image]: http://img.shields.io/npm/v/spun.svg

[travis-url]: https://travis-ci.org/spunjs/spun
[travis-image]: http://img.shields.io/travis/spunjs/spun.svg

[coveralls-url]: https://coveralls.io/r/spunjs/spun
[coveralls-image]: http://img.shields.io/coveralls/spunjs/spun/master.svg
