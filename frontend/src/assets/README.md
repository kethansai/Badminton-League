# Public Visual Assets

These images illustrate badminton, not ABPL participants or events. The public footer contains expandable source and license links. Photographs are resized, JPEG-compressed, cropped by the responsive layouts, and darkened by presentation overlays; no subject or endorsement is fabricated.

| File | Origin | Author / Rights | Processing |
| --- | --- | --- | --- |
| court.jpg | https://commons.wikimedia.org/wiki/File:Badminton_court_view.jpg | Darakshanehaluddin; CC0 1.0, https://creativecommons.org/publicdomain/zero/1.0/ | 1280px wide, JPEG quality 84 |
| doubles.jpg | https://commons.wikimedia.org/wiki/File:Badminton_Semifinal_Pan_2007.jpg | Wilson Dias / ABr; CC BY 2.5, https://creativecommons.org/licenses/by/2.5/ | 1600px wide, JPEG quality 84; Brazil/USA doubles, 2007 Pan American Games |
| smash.jpg | https://commons.wikimedia.org/wiki/File:Badminton_Peter_Gade.jpg | petergade.net; permission attributed to Manuel Roesler; CC BY 2.0, https://creativecommons.org/licenses/by/2.0/ | 1100px wide, JPEG quality 84; Peter Gade, not an ABPL player portrait |
| shuttle-poster.png | Original Three.js render from ../graphics/shuttle.js | Original project geometry, no external model or generated-image service | Transparent 704x677 PNG, cropped to nontransparent model bounds with 10px padding |
| shuttle-poster-mobile.png | Original compact Three.js pose from ../graphics/shuttle.js | Original project geometry | Transparent 655x493 PNG, horizontal compact pose, 10px padding |
| logo.png | Existing ABPL crest supplied in this repository | Existing brand asset; no new license assertion | Unchanged pixels |

The shuttle is assembled from original Three.js geometry: sixteen curved feather meshes and shafts, a procedural barb/ridge bump texture, two stitching rings, a leather-covered base, and a gold band. Directional lighting and self-shadowing reveal feather overlap. Its still image is a WebGL fallback, not a substitute for the live interactive model. Study captures from the Instagram references are kept outside the frontend and are never shipped.

Anton, Barlow, and Barlow Condensed are self-hosted from their Fontsource packages. The corresponding upstream license notices ship in public/font-license-anton.txt, public/font-license-barlow.txt, and public/font-license-barlow-condensed.txt and are linked from the footer's asset credits. Font weights match the previous Google Fonts integration.