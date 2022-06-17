import { Dropbox } from "dropbox";
import fetch from "isomorphic-fetch";
import { arrayBufferToBinaryString } from "blob-util";
import fs from "fs";
import TurndownService from "turndown";
import showdown from "showdown";

const showdownService = new showdown.Converter();
const turndownService = new TurndownService();

const ACCESS_TOKEN = process.env["ACCESS_TOKEN"];
const FOLDER = process.env["FOLDER"];

(async () => {
  const dbx = new Dropbox({ accessToken: ACCESS_TOKEN, fetch });

  const {
    result: { entries }
  } = await dbx.filesListFolder({ path: FOLDER });

  (
    await Promise.all(entries.map(({ id }) => dbx.filesExport({ path: id })))
  ).forEach(
    ({
      result: {
        file_metadata: { rev },
        fileBinary
      }
    }) => {
      const htmlData = arrayBufferToBinaryString(fileBinary);
      const mdData = turndownService.turndown(htmlData);

      fs.writeFileSync(`${rev}.html`, htmlData);
      fs.writeFileSync(`${rev}.md`, mdData);
      fs.writeFileSync(`${rev}-2.html`, showdownService.makeHtml(mdData));
    }
  );
})();
