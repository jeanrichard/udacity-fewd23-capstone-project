npx prettier --write .

# https://github.com/prettier/prettier/issues/15476
sed -i 's/<!doctype html>/<!DOCTYPE html>'/ ./src/views/index.html
