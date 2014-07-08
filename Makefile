test:
	@$$(npm bin)/mocha $T ./test/**/*.tests.js

.PHONY: test
