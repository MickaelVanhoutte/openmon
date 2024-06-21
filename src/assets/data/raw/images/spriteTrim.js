
import ConvertAPI from 'convertapi';
import {exec} from 'child_process';

const convertapi = new ConvertAPI('3Ve7rH2sySilaj1X', {
    downloadTimeout: 1200,
    uploadTimeout: 1200,
});

exec("magick '045s.gif[0]' -trim test.png");
exec("magick test.png -gravity center -background none -extent `identify -format '%wx%h' test.png` -coalesce test.gif ");
