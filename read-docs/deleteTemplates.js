import { Dropbox } from "dropbox";
import fetch from "isomorphic-fetch";

const ACCESS_TOKEN = process.env["ACCESS_TOKEN"];

//Deletes all templates
(async () => {

    const dbx = await new Dropbox({ accessToken: ACCESS_TOKEN, fetch });

    const { result: { template_ids  } } = await dbx.filePropertiesTemplatesListForUser();

    console.log(`Removing ${template_ids.length} templates...`);
    for (let i = 0; i < template_ids.length; i++) {
        
        const template_id = template_ids[i];
        console.log("Removing template...");
        await dbx.filePropertiesTemplatesRemoveForUser({ template_id });
    }

    console.log("Removed templates");

})();