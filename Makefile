
build: components index.js
	@component build --dev

components: component.json
	@component install --dev

test: build
	mocha-phantomjs test/index.html

clean:
	rm -fr build components template.js

.PHONY: clean test
