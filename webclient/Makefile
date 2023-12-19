
.phony: css
css: css/elements.css css/load.css css/print.css css/screen.css css/sprites.css css/style.css

# This does not work currently.
# We are missing compass'
css/%.css: sass/%.scss
	sassc $< $@
