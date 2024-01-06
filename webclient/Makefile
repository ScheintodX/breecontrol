CSS_NAMES=login elements load print screen index
CSS_FILES=$(addprefix css/, $(addsuffix .css, $(CSS_NAMES)))


all: $(CSS_FILES)

#resources.bundle.js: resources.js
#	npx esbuild $< --bundle --format=esm --outfile=$@  --log-level=debug

SASS=node_modules/sass/sass.js

css/%.css: scss/%.scss
	$(SASS) $< $@

.phony: css
css: $(CSS_FILES)

