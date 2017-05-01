all: v0.8 v0.10 v0.12 v4. v6. v7.

v%:
	n $@ && npm test

.PHONY: all
