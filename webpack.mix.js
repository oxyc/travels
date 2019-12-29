const childProcess = require('child_process');
const mix = require('laravel-mix');
const fs = require('fs-extra');
const yaml = require('js-yaml');

mix.setPublicPath('./dist');

mix.sass('_resources/styles/app.scss', 'styles')
  .sass('_resources/styles/abovefold.scss', '../_includes/')
  .js('_resources/scripts/app.js', 'scripts')
  .extract()
  .options({
    processCssUrls: false
  })
  .then(() => {
    const manifest = fs.readJsonSync('./dist/mix-manifest.json');
    const config = yaml.safeLoad(fs.readFileSync('./_config.yml', 'utf8'));
    config.assets = manifest;
    fs.writeFileSync('./_config.yml', yaml.safeDump(config));
    childProcess.execSync('bundle exec jekyll build');
  });

mix.copyDirectory('_resources/images', 'dist/images');
mix.copyDirectory('node_modules/leaflet/dist/images', 'dist/styles/images');

mix.sourceMaps(false, 'source-map')
  .version();
