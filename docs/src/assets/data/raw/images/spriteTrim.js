import ConvertAPI from 'convertapi';
import { exec } from 'child_process';

const convertapi = new ConvertAPI('3Ve7rH2sySilaj1X', {
	downloadTimeout: 1200,
	uploadTimeout: 1200
});

let source =
	'/Users/perso/workspace/perso/showdown/play.pokemonshowdown.com/sprites/gen5/dartrix.png';
//let dest = "/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/002.gif";
let dest = '/Users/perso/workspace/perso/openmon/src/assets/data/raw/images/002.gif';
let tmp = '/Users/perso/workspace/perso/openmon/src/assets/monsters/animated/0000.png';

//exec("magick "+source+" "+dest); // to gif
//exec("magick '"+dest+"[0]' -trim "+source); //back to png for trimming
//exec("magick '"+source+"' -gravity center -background none -extent `identify -format '%wx%h' '"+source+"'` '"+dest+"'");

//exec("magick '"+dest+"[0]' -trim '"+tmp+"'"); //back to png for trimming

var identity = exec("identify -format '%wx%h' '" + source + "'");
//exec("magick '"+source+"'  -background none -gravity center -extent `'identify -format '%wx%h' '"+source+"'` -coalesce '"+dest+"'");
// exec("magick '"+source+"' -trim  -background none -gravity center -coalesce "+dest, (error, stdout, stderr) => {
//     stderr && console.log(stderr);
// });
exec(
	"magick -dispose 2 '" + source + "' -trim -layers TrimBounds '" + dest + "'",
	(error, stdout, stderr) => {
		stderr && console.log(stderr);
	}
);
var identity2 = exec("identify -format '%wx%h' '" + dest + "'");

identity.stdout.on('data', function (data) {
	console.log('source: ' + data);
});
identity2.stdout.on('data', function (data) {
	console.log('result:' + data);
});

//console.log("magick '"+tmp+"' -gravity center -background none -extent `identify -format '%wx%h' '"+tmp+"'` -coalesce '"+dest+"'");
//exec("magick '"+dest+"[0]'  -trim -background none  '"+dest+"'"); //trim
