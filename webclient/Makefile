
#while true; do node_modules/sass/sass.js scss/login.scss:css/login.css; sleep 1; done


SASS=node_modules/sass/sass.js

css/%.css: scss/%.scss
	$(SASS) $< $@

.phony: css
css: css/login.css css/elements.css css/load.css css/print.css css/screen.css css/sprites.css css/style.css

