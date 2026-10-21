# Bundled fonts

Mailven bundles its two typefaces so mail looks the same offline. `frontend/src/app.css` loads them with `@font-face` and `font-display: swap`; nothing is fetched from the network at run time. Both are licensed under the SIL Open Font License 1.1, whose text sits beside each family's files (`OFL.txt`).

| File | Family | Version | Upstream source | SHA-256 |
| --- | --- | --- | --- | --- |
| `inter/InterVariable.woff2` | Inter (variable, `wght` 100–900, roman) | 4.1 | [rsms/inter v4.1](https://github.com/rsms/inter/releases/tag/v4.1), `docs/font-files/InterVariable.woff2` | `693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3` |
| `inter/OFL.txt` | Inter license | 4.1 | `LICENSE.txt` of the same tag | `262481e844521b326f5ecd053e59b98c8b2da78c8ee1bdbb6e8174305e54935a` |
| `literata/Literata-opsz-wght.woff2` | Literata (variable, `opsz` and `wght` 200–900, roman) | 3.103 | [googlefonts/literata 3.103](https://github.com/googlefonts/literata/releases/tag/3.103), `fonts/webfonts/Literata[opsz,wght].woff2` | `5e50643479bee69e0204164602f830502b0db42bbc29da83edc9980df17e34df` |
| `literata/Literata-Italic-opsz-wght.woff2` | Literata (variable, italic) | 3.103 | same release, `fonts/webfonts/Literata-Italic[opsz,wght].woff2` | `ddfb5600779fccc34c8fc6ff32a1b60a04355e9ae00a230539d852de7e0eb4ee` |
| `literata/OFL.txt` | Literata license | 3.103 | `OFL.txt` of the same tag | `8742963604cd89dc81437811a850018fc03b2bfad686d7422c8235967c87614e` |

Copyright: Inter, The Inter Project Authors; Literata, The Literata Project Authors.

The files are byte-for-byte the upstream release files. The Literata files were renamed only to drop the brackets and comma from their names (`[opsz,wght]` → `-opsz-wght`); they are not modified, so the OFL's Reserved Font Name terms do not apply.

The files are not subset. Together they add about 1.1 MB to the bundle (352 kB Inter, 396 kB per Literata style). Subset only if the bundle size becomes a problem; a Literata subset must keep Latin Extended, Cyrillic, Greek and Vietnamese, because email content is international. Scripts the fonts lack fall back to the system stack in `--font-ui` and `--font-read`.

To update a font, download the files from the upstream release (not the Google Fonts CSS API), record the new version and SHA-256 here, and update `THIRD_PARTY_NOTICES.md`.
