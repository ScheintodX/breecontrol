
.phony: css
css: css/elements.css css/load.css css/print.css css/screen.css css/sprites.css css/style.css

css/%.css: sass/%.scss
	sassc $< $@
